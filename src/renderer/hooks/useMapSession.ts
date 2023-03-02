import { useState } from 'react';
import { setDrawingSession, getSessionToStr } from '../state/session';

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
    console.log(`>> tile width: ${width}`);
    setDrawingSession({ tileWidth: width });
    setTileWidth(width);
  };

  const setAllDimension = (mh: number, mw: number, th: number, tw: number) => {
    console.log(`>>> set all dimension!`);
    // mapHeightChangeHandler(`${mh}`);
    // mapWidthChangeHandler(`${mw}`);
    // tileHeightChangeHandler(`${th}`);
    // tileWidthChangeHandler(`${tw}`);
  };

  return {
    mapHeight,
    mapWidth,
    tileHeight,
    tileWidth,
    setAllDimension,
    mapHeightChangeHandler,
    mapWidthChangeHandler,
    tileHeightChangeHandler,
    tileWidthChangeHandler,
  };
};
