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
    // FIXME: lazyness notify editor to `drawTilePicker`
    // to waiting for editor creation when switch back from other page
    // @2022/11/16
    // setTimeout(() => {
    //   const detail = { detail: selectedImage };
    //   const customEvt = new CustomEvent(GWEvent.SELECTEDIMAGE, detail);
    //   document.dispatchEvent(customEvt);
    // });
    // cache it while select changed
    setDrawingSession({ selectedImage });
  }, [selectedImage]);

  return {
    selectedImage,
    setSelectedImage,
  };
};
