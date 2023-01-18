/**
 * Created @2022/11/15
 */

import * as PIXI from 'pixi.js';
import { getImageDataGrid, generateImageTextures } from '../tiled/ImageBit';

type FileBlob = {
  /** file path in local directory */
  path: string;
  /** image url from blob, can be used in img tag */
  imgURL: string;
  /** to get image data */
  blob: Blob;
  /** png file width in pixels */
  width: number;
  /** png file height in pixels */
  height: number;
};

export type ImageDataTiles = {
  context: CanvasRenderingContext2D | null;
  tw: number; // tile width
  th: number; // tile height
  tiles: ImageData[][];
  textures: PIXI.Texture[][];
};

type ImageCache = { [imgURL: string]: ImageDataTiles };

// NOTE: do not expose this cache!
// use list rather than map to facilitate preview dots generation
const imageBlobs: FileBlob[] = [];
const imageDataCache: ImageCache = {};

/** *******************************************
 * most useful api for this cache
 * @param imgURL local image url
 * @returns cached textures
 * *********************************************
 */
export const getTileSheetBy = (imgURL: string): ImageDataTiles => {
  return imageDataCache[imgURL] || {};
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
  const empty = { tw: 0, th: 0, tiles: [], textures: [], context: null };
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
    context: null,
  };
};

export const getTileImageDots = (selectedImage: string) => {
  return imageBlobs.map((file) => (file.imgURL === selectedImage ? 1 : 0));
};

export const checkImageLoaded = (pngFilePath: string) => {
  return imageBlobs.find((item) => item.path === pngFilePath);
};

/**
 * Put loaded png into a list
 * @param pngFilePath png path
 * @param imgURL url for loading
 * @param blob Blob
 * @param width png width
 * @param height png height
 */
export const cacheImageBlob = (
  pngFilePath: string,
  imgURL: string,
  blob: Blob,
  width: number,
  height: number
) => {
  const png = {
    path: pngFilePath,
    imgURL,
    blob,
    width,
    height,
  };
  imageBlobs.push(png);
};

export const cacheImageTextures = (
  context: CanvasRenderingContext2D,
  imgURL: string,
  tw: number,
  th: number
) => {
  if (!imgURL) return null;
  const tiles = getImageDataGrid(context, tw, th);
  const textures = generateImageTextures(context, tw, th);
  imageDataCache[imgURL] = {
    tw,
    th,
    tiles,
    textures,
    context,
  };
  return textures;
};

/**
 * recreate all the tiles and textures for all loaded images
 * @param tileWidth
 * @param tileHeight
 * @param selectedImage
 * @returns newly created tiles
 */
export const resetCachedTextures = (
  tileWidth: number,
  tileHeight: number,
  selectedImage: string
) => {
  if (!selectedImage) {
    // console.log('empty image ....');
    return null; // could be ''
  }
  // console.log(`>>> reset img: ${selectedImage}`);
  const { tw, th, context, textures } = imageDataCache[selectedImage];
  if (!context) {
    // console.log(`context is empty?`);
    return null; // maybe undefined
  }
  if (tileWidth === tw && tileHeight === th) return textures; // already set
  const tiles = cacheImageTextures(
    context,
    selectedImage,
    tileWidth,
    tileHeight
  );
  return tiles;
};
