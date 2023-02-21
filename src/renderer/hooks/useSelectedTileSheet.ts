import { useState, useEffect } from 'react';
import { setDrawingSession, getSessionToStr } from '../state/session';

import { GWEvent } from '../tiled/Events';

/**
 * Used in `useSpriteSheetImage`
 *
 * @returns
 */
export const useSelectedTileSheet = () => {
  const cachedSelectedImage = getSessionToStr('selectedImage');
  const [selectedImage, setSelectedImage] = useState(cachedSelectedImage);

  useEffect(() => {
    if (!selectedImage) return;
    // cache it while select changed
    setDrawingSession({ selectedImage });
  }, [selectedImage]);

  return {
    selectedImage,
    setSelectedImage,
  };
};
