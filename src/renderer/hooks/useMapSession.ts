import { useState, useEffect } from 'react';
import { setDrawingSession, getSessionToStr } from '../state/session';

import { GWEvent } from '../tiled/Events';

/**
 * Used in `TiledEditorPage`
 * @returns
 */
export const useMapDimension = () => {
  const iMH = getSessionToStr('mapHeight') || '20';
  const iMW = getSessionToStr('mapWidth') || '30';
  const iTH = getSessionToStr('tileHeight') || '32';
  const iTW = getSessionToStr('tileWidth') || '32';

  const [mapHeight, setMapHeight] = useState(iMH);
  const [mapWidth, setMapWidth] = useState(iMW);
  const [tileHeight, setTileHeight] = useState(iTH);
  const [tileWidth, setTileWidth] = useState(iTW);

  const mapHeightChangeHandler = (height: string) => {
    setDrawingSession({ mapHeight: height });
    setMapHeight(height);
  };

  const mapWidthChangeHandler = (width: string) => {
    setDrawingSession({ mapWidth: width });
    setMapWidth(width);
  };

  const tileHeightChangeHandler = (height: string) => {
    setDrawingSession({ tileHeight: height });
    setTileHeight(height);
  };

  const tileWidthChangeHandler = (width: string) => {
    setDrawingSession({ tileWidth: width });
    setTileWidth(width);
  };

  return {
    mapHeight,
    mapWidth,
    tileHeight,
    tileWidth,
    mapHeightChangeHandler,
    mapWidthChangeHandler,
    tileHeightChangeHandler,
    tileWidthChangeHandler,
  };
};

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
    setTimeout(() => {
      const detail = { detail: selectedImage };
      const customEvt = new CustomEvent(GWEvent.SELECTEDIMAGE, detail);
      document.dispatchEvent(customEvt);
    });
    // cache it while select changed
    setDrawingSession({ selectedImage });
  }, [selectedImage]);

  return {
    selectedImage,
    setSelectedImage,
  };
};
