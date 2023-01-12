import { useState } from 'react';
import { kebabCase } from '../utils';

export const useMapFile = (wokspacePath: string) => {
  const [mapName, setMapName] = useState('');
  const [newMapSaved, setNewMapSaved] = useState(false);
  const [mapFilePath, setMapFilePath] = useState('');
  // const [mapFileLoaded, setMapFileLoaded] = useState(false);

  const mapSaveHandler = (name: string, path: string) => {
    setNewMapSaved(true);
    setMapName(name);
    setMapFilePath(path);
    // TODO: save to file system...
  };

  const createNewMapHandler = () => {
    setNewMapSaved(false);
  };

  return {
    mapName,
    mapFilePath,
    newMapSaved,
    mapSaveHandler,
    createNewMapHandler,
  };
};
