import { useState } from 'react';

import { PNGFile } from '../../interfaces';
import { IpcEvents } from '../../ipc-events';
import appMeta from '../assets/app.json';
import { getImageContext } from '../tiled/ImageBit';

import {
  getTileImageDots,
  checkImageLoaded,
  checkImageBlobSize,
  cacheImageBlob,
  cacheImageTextures,
  getNextImageURL,
  getPrevImageURL,
} from '../state/cache';

import { useSelectedTileSheet } from './useSelectedTileSheet';

import { TileSheetImage } from '../config';

/**
 * Open dialog to pickup sprite sheet image file, and cache it
 * @2022/10/20
 *
 * @returns
 */
export const useSpriteSheetImage = (
  tileWidth: number,
  tileHeight: number,
  workspacePath: string,
  addSuccessToast: (msg: string) => void,
  addWarningToast: (msg: string) => void
) => {
  const { ipcRenderer } = window.electron;
  // image URL locally
  const { selectedImage, setSelectedImage } = useSelectedTileSheet();
  const dots: number[] = getTileImageDots(selectedImage);

  const [isLoadingTilesheet, setIsLoadingTilesheet] = useState(false);

  const generateImageCtx = async (pngImg: PNGFile) => {
    const { buffer, width, height, path } = pngImg as PNGFile;
    const blob = new Blob([buffer], { type: 'image/png' });
    const imgURL = URL.createObjectURL(blob);
    cacheImageBlob(path, imgURL, blob, width, height);
    // cache the image data for later use
    const context = await getImageContext(blob);
    const safeW = tileWidth || 32;
    const safeH = tileHeight || 32;
    // TODO: need to consider tile size for loaded image...
    // for downloaded spritesheet, should display hint to user to make tile size change.
    // asume it has the same size with the tile inputs now!
    // tile size setting should only have single source and applying for tilegrid,
    cacheImageTextures(context, imgURL, safeW, safeH);

    return imgURL;
  };

  /**
   * After tilesheet file loaded, the `selectedImage` will be initialized!
   * @param pngFilePath
   * @returns
   */
  const loadPngFile = async (pngFilePath: string): Promise<boolean> => {
    // check if already loaded
    const imageBlobExist = checkImageLoaded(pngFilePath);
    if (imageBlobExist) {
      setSelectedImage(imageBlobExist.imgURL);
      return true; // no need to fetch again!
    }
    // *** reading file buffer ***
    const pngImg = await ipcRenderer.invoke(
      IpcEvents.READ_PNG_IMAGE,
      pngFilePath
    );
    if (pngImg && !imageBlobExist) {
      const imgURL = await generateImageCtx(pngImg as PNGFile);
      // save the selected file page
      setSelectedImage(imgURL);
      return true;
    }
    console.warn(`### file no longer exists: ${pngFilePath}`);
    return false;
  };

  const openFileDialog = async () => {
    const files = (await ipcRenderer.invoke(
      IpcEvents.OPEN_FILE_FROM_DIALOG,
      'Open Sprite Sheet File' // new folder to be created in selected path
    )) as string[];
    if (files.length === 0) return;

    // only pick first one!
    const pngFilePath = files[0];
    await loadPngFile(pngFilePath);
  };

  const navigateToNext = () => {
    const next = getNextImageURL(selectedImage);
    next && setSelectedImage(next);
  };

  const navigateToPrev = () => {
    const prev = getPrevImageURL(selectedImage);
    prev && setSelectedImage(prev);
  };

  /**
   * Tricky function for Promise Array handling from:
   * https://css-tricks.com/why-using-reduce-to-sequentially-resolve-promises-works/
   * @date 2023/04/30
   * @param pngPaths
   * @returns
   */
  const readTilesheetsImages = async (pngPaths: string[]) => {
    const ps = pngPaths.reduce(
      async (previousPromise: Promise<string>, path: string) => {
        await previousPromise;
        const pathToContext = async (png: string) => {
          const imageBlobExist = checkImageLoaded(png);
          if (!imageBlobExist) {
            const pngImg = await ipcRenderer.invoke(
              IpcEvents.READ_PNG_IMAGE,
              png
            );
            if (!pngImg) {
              console.warn('>> no png loaded!');
              return ''; // png net existed
            }
            // console.log(`## got png file!`);
            // console.log((pngImg as PNGFile).path);
            // console.log(`>> to generate image ctx...`);
            const imgLocalURL = await generateImageCtx(pngImg as PNGFile);
            // console.log(`## got imgurl:`);
            // console.log(imgLocalURL);
            return imgLocalURL;
          }
          return imageBlobExist.imgURL;
        };
        return pathToContext(path);
      },
      Promise.resolve('')
    );
    const result = await ps;
    // console.log(`## got final result!`);
    // console.log(result);
    return result;
  };

  const loadRemoteTilesheets = async () => {
    // 1st check: space
    if (!workspacePath) {
      return addWarningToast('Setting workspace first!');
    }
    // 2nd check: is loading
    if (isLoadingTilesheet) return;

    // 4th check: is downloaded locally ?
    const tilesPath = `${workspacePath}/tiles`;
    const isTileDirExisting = await ipcRenderer.invoke(
      IpcEvents.CHECK_DIR_EXISTS,
      tilesPath
    );
    // console.log({ isTileDirExisting });

    // 3rd check: is loaded in memory ?
    // the tile object size in index.json is 8 at this moment
    // @2023/05/08
    const tileSize = checkImageBlobSize();
    if (tileSize >= 8) return;

    // start downloading...
    setIsLoadingTilesheet(true);

    const baseURL = appMeta.baseURL as string;
    const tileIndexPath = appMeta.tilesIndex as string;
    const jsonURL = baseURL + tileIndexPath;
    const jsontFileContent = (await ipcRenderer.invoke(
      IpcEvents.FETCH_REMOTE_JSON,
      jsonURL
    )) as string;
    // tiles config content
    // console.log(jsontFileContent);
    // prepare download data
    const tilesheets = JSON.parse(jsontFileContent) as TileSheetImage[];
    const fileObjs = tilesheets.map((t) => ({
      url: `${baseURL}/${t.path}`,
      path: `${workspacePath}/${t.path}`,
    }));
    // console.log(`>>> download tilesheets...`);
    // console.log(fileObjs);

    // download tilesheet pngs ...
    if (!isTileDirExisting) {
      await ipcRenderer.invoke(IpcEvents.DOWNLOAD_TILESHEETTS, fileObjs);
      addSuccessToast('Tilesheets Download Completed!');
    }
    // console.log(`>>> invoke completed!`);
    setIsLoadingTilesheet(false);

    // load into memory and display thumbnails ...
    const lastTilesheetURL = await readTilesheetsImages(
      fileObjs.map((f) => f.path)
    );
    // show it in the prevew canvas!
    setSelectedImage(lastTilesheetURL);
  };

  return {
    dots,
    isLoadingTilesheet,
    /** tilesheet image url */
    selectedImage,
    /** load png, init `selectedImage` */
    loadPngFile,
    openFileDialog,
    navigateToNext,
    navigateToPrev,
    loadRemoteTilesheets,
  };
};
