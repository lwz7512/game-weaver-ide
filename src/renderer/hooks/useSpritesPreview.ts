import { useEffect } from 'react';
import { getPreviewImageTiles } from './useSpriteSheetImage';

export const useSpritesPreview = (selectedImage: string, dots: number[]) => {
  useEffect(() => {
    if (!selectedImage) return;

    const canvas = document.querySelector(
      '#spritesPreview'
    ) as HTMLCanvasElement;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    // clear before draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { tw, th, tiles } = getPreviewImageTiles(selectedImage);
    if (!tiles || !tiles.length) return;

    ctx.putImageData(tiles[0][0], 0, 0);

    // tiles row
    for (let i = 0; i < 4; i += 1) {
      // column
      for (let j = 0; j < 6; j += 1) {
        ctx.putImageData(tiles[i][j], j * tw, i * th);
      }
    }

    // if (dots.length < 2) return;

    // dots...
    dots.forEach((dot, i) => {
      ctx.beginPath();
      ctx.arc(20 + 15 * i, 110, 5, 0, 2 * Math.PI);
      if (dot) {
        ctx.fillStyle = '#333333';
      } else {
        ctx.fillStyle = '#FFFFFF';
      }
      ctx.fill();
    });
  }, [selectedImage, dots]);
};
