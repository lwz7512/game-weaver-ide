import { PNGFile } from '../../interfaces';
import { IpcEvents } from '../../ipc-events';
import { getImageContext } from '../tiled/ImageBit';

import {
  getTileImageDots,
  checkImageLoaded,
  cacheImageBlob,
  cacheImageTextures,
  getNextImageURL,
  getPrevImageURL,
} from '../state/cache';

import { useSelectedTileSheet } from './useSelectedTileSheet';

/**
 * Open dialog to pickup sprite sheet image file, and cache it
 * @2022/10/20
 *
 * @returns
 */
export const useSpriteSheetImage = (tileWidth: number, tileHeight: number) => {
  const { ipcRenderer } = window.electron;
  // image URL locally
  const { selectedImage, setSelectedImage } = useSelectedTileSheet();
  const dots: number[] = getTileImageDots(selectedImage);

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
      const { buffer, width, height } = pngImg as PNGFile;
      const blob = new Blob([buffer], { type: 'image/png' });
      const imgURL = URL.createObjectURL(blob);
      cacheImageBlob(pngFilePath, imgURL, blob, width, height);
      // cache the image data for later use
      const context = await getImageContext(blob);
      const safeW = tileWidth || 32;
      const safeH = tileHeight || 32;
      // TODO: need to consider tile size for loaded image...
      // for downloaded spritesheet, should display hint to user to make tile size change.
      // asume it has the same size with the tile inputs now!
      // tile size setting should only have single source and applying for tilegrid,
      cacheImageTextures(context, imgURL, safeW, safeH);
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

  return {
    dots,
    selectedImage,
    loadPngFile,
    openFileDialog,
    navigateToNext,
    navigateToPrev,
  };
};
