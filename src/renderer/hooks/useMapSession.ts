import { useState, useEffect } from 'react';
import { setDrawingSession, getSessionBy } from '../state/session';

import { GWEvent } from '../tiled/Events';

export const useMapDimension = () => {
  const [mapHeight, setMapHeight] = useState('20');
  const [mapWidth, setMapWidth] = useState('30');
  const [tileHeight, setTileHeight] = useState('32');
  const [tileWidth, setTileWidth] = useState('32');

  useEffect(() => {
    const session = {
      mapHeight,
      mapWidth,
      tileHeight,
      tileWidth,
    };
    setDrawingSession(session);
  }, [mapHeight, mapWidth, tileHeight, tileWidth]);

  // TODO: if tileWidth, tileHeight changed, all the tiles in `imageDataCache` should update!
  useEffect(() => {
    // if (!tileWidth || !tileHeight) return;
    // ....reset imageDataCache...
    // console.log('>>> reset image data cache by:');
    // console.log({ tileWidth });
    // console.log({ tileHeight });
    // ...
  }, [tileWidth, tileHeight]);

  return {
    mapHeight,
    setMapHeight,
    mapWidth,
    setMapWidth,
    tileHeight,
    setTileHeight,
    tileWidth,
    setTileWidth,
  };
};

export const useSelectedTileSheet = () => {
  const cachedSelectedImage = getSessionBy('selectedImage') as string;
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
    // cache it
    setDrawingSession({ selectedImage });
  }, [selectedImage]);

  return {
    selectedImage,
    setSelectedImage,
  };
};
