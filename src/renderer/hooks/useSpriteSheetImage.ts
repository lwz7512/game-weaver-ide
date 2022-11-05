import { useState, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { IpcEvents } from '../../ipc-events';
import {
  getImageContext,
  getImageDataGrid,
  getImageTextures,
} from '../tiled/ImageBit';

import { GWEvent } from '../tiled/Events';

type FileBlob = {
  path: string; // file path in local directory
  imgURL: string; // image url from blob, can be used in img tag
  blob: Blob; // to get image data
};

type ImageDataTiles = {
  tw: number; // tile width
  th: number; // tile height
  tiles: ImageData[][];
  textures: PIXI.Texture[][];
};

type ImageCache = { [imgURL: string]: ImageDataTiles };

// NOTE: do not expose this cache!
const imageBlobs: FileBlob[] = [];
const imageDataCache: ImageCache = {};

export const getTileSheetBy = (imgURL: string): ImageDataTiles => {
  return imageDataCache[imgURL];
};

export const getPreviewDots = () => {
  return imageBlobs.length;
};

export const getNextImageURL = (imgURL: string): string | null => {
  if (!imgURL) return null;

  const index = imageBlobs.findIndex((file) => file.imgURL === imgURL);
  if (index === -1) return null;

  const nextFile = imageBlobs[index + 1];
  if (nextFile) return nextFile.imgURL;

  return null;
};

export const getPrevImageURL = (imgURL: string): string | null => {
  if (!imgURL) return null;

  const index = imageBlobs.findIndex((file) => file.imgURL === imgURL);
  if (index === -1) return null;

  const prevFile = imageBlobs[index - 1];
  if (prevFile) return prevFile.imgURL;

  return null;
};

/**
 * Get top left 24 tiles(4rows * 6columns) image data, assume each tile is 32x32.
 *
 * [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]
 *
 * [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]
 *
 * [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5]
 *
 * [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5]
 *
 * @param imgURL image path
 */
export const getPreviewImageTiles = (imgURL: string): ImageDataTiles => {
  const empty = { tw: 0, th: 0, tiles: [], textures: [] };
  if (!imgURL) return empty;

  const { tw, th, tiles } = imageDataCache[imgURL] || {};

  // undefined
  if (!tiles || !tiles.length) return empty;

  const topLeftTiles = [
    tiles[0].slice(0, 6),
    tiles[1].slice(0, 6),
    tiles[2].slice(0, 6),
    tiles[3].slice(0, 6),
  ];

  return {
    tw,
    th,
    tiles: topLeftTiles,
    textures: [],
  };
};

/**
 * Open dialog to pickup sprite sheet image file, and cache it
 * @2022/10/20
 *
 * @returns
 */
export const useSpriteSheetImage = (tileWidth: number, tileHeight: number) => {
  const { ipcRenderer } = window.electron;
  const [selectedImage, setSelectedImage] = useState('');

  const dots: number[] = imageBlobs.map((file) =>
    file.imgURL === selectedImage ? 1 : 0
  );

  useEffect(() => {
    if (!selectedImage) return;

    const detail = { detail: selectedImage };
    const customEvt = new CustomEvent(GWEvent.SELECTEDIMAGE, detail);
    document.dispatchEvent(customEvt);
  }, [selectedImage]);

  // TODO: if tileWidth, tileHeight changed, all the tiles in `imageDataCache` should update!
  useEffect(() => {
    // if (!tileWidth || !tileHeight) return;
    // ....reset imageDataCache...
    // console.log('>>> reset image data cache by:');
    // console.log({ tileWidth });
    // console.log({ tileHeight });
    // ...
  }, [tileWidth, tileHeight]);

  const openFileDialog = async () => {
    const files = (await ipcRenderer.invoke(
      IpcEvents.OPEN_FILE_FROM_DIALOG,
      'Open Sprite Sheet File' // new folder to be created in selected path
    )) as string[];
    if (files.length === 0) return;

    // only pick first one!
    const pngFilePath = files[0];
    // check if already loaded
    const imageBlobExist = imageBlobs.find((item) => item.path === pngFilePath);
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
      imageBlobs.push({ path: pngFilePath, imgURL, blob });

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
      imageDataCache[imgURL] = {
        tw: safeW,
        th: safeH,
        tiles,
        textures,
      };
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
