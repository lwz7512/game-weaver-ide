/**
 * Created @2022/11/15
 */

import * as PIXI from 'pixi.js';

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

export const getTileImageDots = (selectedImage: string) => {
  return imageBlobs.map((file) => (file.imgURL === selectedImage ? 1 : 0));
};

export const checkImageLoaded = (pngFilePath: string) => {
  return imageBlobs.find((item) => item.path === pngFilePath);
};

export const cacheImageBlob = (
  pngFilePath: string,
  imgURL: string,
  blob: Blob
) => {
  imageBlobs.push({ path: pngFilePath, imgURL, blob });
};

export const cacheImageTextures = (
  imgURL: string,
  tw: number,
  th: number,
  tiles: ImageData[][],
  textures: PIXI.Texture[][]
) => {
  imageDataCache[imgURL] = {
    tw,
    th,
    tiles,
    textures,
  };
};
