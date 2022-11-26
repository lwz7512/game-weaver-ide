import * as PIXI from 'pixi.js';

type CTX2D = CanvasRenderingContext2D;

/**
 * create virtual canvas context
 * @param width
 * @param height
 * @param dpi
 * @returns
 */
export const context2d = (width: number, height: number, dpi = 1) => {
  const realDpi = dpi || devicePixelRatio;
  const canvas = document.createElement('canvas');
  canvas.width = width * realDpi;
  canvas.height = height * realDpi;
  const context = canvas.getContext('2d');
  return context as CTX2D;
};

/**
 * transform image to a canvas context2d to facilitate ImageData pickup
 *
 * @param blob image binary data
 * @returns context2d
 */
export const getImageContext = async (blob: Blob) => {
  const bitmap = await window.createImageBitmap(blob);
  const [width, height] = [bitmap.width, bitmap.height];
  // an intermediate "buffer" 2D context is necessary
  const ctx = context2d(width, height, 1);
  ctx.drawImage(bitmap, 0, 0);

  return ctx;
};

/**
 * create imagedata grid
 *
 * @param context canvas context2d
 * @param tw tile width
 * @param th tile height
 */
export const getImageDataGrid = (
  context: CTX2D,
  tw = 32,
  th = 32
): ImageData[][] => {
  const rows = Math.ceil(context.canvas.height / th);
  const columns = Math.ceil(context.canvas.width / tw);
  const cellMatrix = [];
  // vertical
  for (let i = 0; i < rows; i += 1) {
    const row = [];
    // horizontal
    for (let j = 0; j < columns; j += 1) {
      const cellData = context.getImageData(j * tw, i * th, tw, th);
      row.push(cellData);
    }
    cellMatrix.push(row);
  }
  return cellMatrix;
};

export const generateImageTextures = (
  context: CTX2D,
  tw = 32,
  th = 32
): PIXI.Texture[][] => {
  const rows = Math.ceil(context.canvas.height / th);
  const columns = Math.ceil(context.canvas.width / tw);
  const textures = [];
  // vertical
  for (let i = 0; i < rows; i += 1) {
    const row: PIXI.Texture[] = [];
    // horizontal
    for (let j = 0; j < columns; j += 1) {
      const cellData = context.getImageData(j * tw, i * th, tw, th);
      const cell = document.createElement('canvas');
      cell.width = tw;
      cell.height = th;
      const ctx = cell.getContext('2d') as CTX2D;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.putImageData(cellData, 0, 0);
      const texture = PIXI.Texture.from(cell);
      row.push(texture);
    }
    textures.push(row);
  }
  return textures;
};
