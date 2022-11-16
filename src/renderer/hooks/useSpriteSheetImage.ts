import { IpcEvents } from '../../ipc-events';
import {
  getImageContext,
  getImageDataGrid,
  getImageTextures,
} from '../tiled/ImageBit';

import {
  getTileImageDots,
  checkImageLoaded,
  cacheImageBlob,
  cacheImageTextures,
  getNextImageURL,
  getPrevImageURL,
} from '../state/cache';

import { useSelectedTileSheet } from './useMapSession';

/**
 * Open dialog to pickup sprite sheet image file, and cache it
 * @2022/10/20
 *
 * @returns
 */
export const useSpriteSheetImage = (tileWidth: number, tileHeight: number) => {
  const { ipcRenderer } = window.electron;
  const { selectedImage, setSelectedImage } = useSelectedTileSheet();
  const dots: number[] = getTileImageDots(selectedImage);

  const openFileDialog = async () => {
    const files = (await ipcRenderer.invoke(
      IpcEvents.OPEN_FILE_FROM_DIALOG,
      'Open Sprite Sheet File' // new folder to be created in selected path
    )) as string[];
    if (files.length === 0) return;

    // only pick first one!
    const pngFilePath = files[0];
    // check if already loaded
    const imageBlobExist = checkImageLoaded(pngFilePath);
    if (imageBlobExist) {
      setSelectedImage(imageBlobExist.imgURL);
      return; // no need to fetch again!
    }
    // *** reading file buffer ***
    const imageBlob = await ipcRenderer.invoke(
      IpcEvents.READ_IMAGE_FILE,
      pngFilePath
    );
    if (imageBlob && !imageBlobExist) {
      const buffer = imageBlob as Buffer;
      const blob = new Blob([buffer], { type: 'image/png' });
      const imgURL = URL.createObjectURL(blob);
      cacheImageBlob(pngFilePath, imgURL, blob);

      // cache the image data for later use
      const context = await getImageContext(blob);
      const safeW = tileWidth || 32;
      const safeH = tileHeight || 32;
      // TODO: need to consider tile size for loaded image...
      // for downloaded spritesheet, should display hint to user to make tile size change.
      // asume it has the same size with the tile inputs now!
      // tile size setting should only have single source and applying for tilegrid,
      const tiles = getImageDataGrid(context, safeW, safeH);
      const textures = getImageTextures(context, safeW, safeH);
      cacheImageTextures(imgURL, safeW, safeH, tiles, textures);
      // save the selected file page
      setSelectedImage(imgURL);
    } else {
      console.warn(`### file no longer esists: ${pngFilePath}`);
    }
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
    openFileDialog,
    navigateToNext,
    navigateToPrev,
  };
};
