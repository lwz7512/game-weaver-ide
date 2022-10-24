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
  console.log({ realDpi });
  canvas.width = width * realDpi;
  canvas.height = height * realDpi;
  // canvas.style.width = `${width}px;`;
  const context = canvas.getContext('2d');
  context && context.scale(dpi, dpi);
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
  console.log({ width });
  console.log({ height });
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
export const getImageDataGrid = (context: CTX2D, tw = 32, th = 32) => {
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
