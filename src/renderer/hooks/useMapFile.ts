import { useState } from 'react';
import { kebabCase } from '../utils';

export const useMapFile = (wokspacePath: string) => {
  const [mapName, setMapName] = useState('');
  const [newMapSaved, setNewMapSaved] = useState(false);
  const [mapFileLoaded, setMapFileLoaded] = useState(false);

  const mapSaveHandler = (name: string, path: string) => {
    // TODO:
    setNewMapSaved(true);
    setMapName(name);
  };

  const createNewMapHandler = () => {
    setNewMapSaved(false);
  };

  return {
    mapName,
    newMapSaved,
    mapSaveHandler,
    createNewMapHandler,
  };
};
