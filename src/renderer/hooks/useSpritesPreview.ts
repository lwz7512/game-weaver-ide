import { useEffect } from 'react';
import { getPreviewImageTiles } from './useSpriteSheetImage';

export const useSpritesPreview = (selectedImage: string) => {
  useEffect(() => {
    if (!selectedImage) return;

    const canvas = document.querySelector(
      '#spritesPreview'
    ) as HTMLCanvasElement;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { tw, th, tiles } = getPreviewImageTiles(selectedImage);
    if (!tiles || !tiles.length) return;

    ctx.putImageData(tiles[0][0], 0, 0);

    // row
    for (let i = 0; i < 4; i += 1) {
      // column
      for (let j = 0; j < 6; j += 1) {
        ctx.putImageData(tiles[i][j], j * tw, i * th);
      }
    }
    // ...
  }, [selectedImage]);
};
