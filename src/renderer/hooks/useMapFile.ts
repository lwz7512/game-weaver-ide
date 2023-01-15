import { useState, useRef } from 'react';
import { GameMapXportParams } from 'renderer/config';
import { TiledPainter } from '../tiled/Painter';
// import { kebabCase } from '../utils';

export const useMapFile = (
  wokspacePath: string,
  mapParams: GameMapXportParams
) => {
  const [mapName, setMapName] = useState('');
  const [newMapSaved, setNewMapSaved] = useState(false);
  const [mapFilePath, setMapFilePath] = useState('');
  // const [mapFileLoaded, setMapFileLoaded] = useState(false);
  const editorRef = useRef<TiledPainter | null>(null);

  const createNewMapHandler = () => {
    setNewMapSaved(false);
  };

  /**
   * export map data to phaserjs format...
   */
  const mapExportHandler = () => {
    const editor = editorRef.current as TiledPainter;
    console.log(`>>> save game map data:`);
    const map = editor.getPhaserMapInfo();
    console.log(map);
  };

  /**
   * save map to file system...
   *
   * @param name map name
   * @param path json path
   */
  const mapSaveHandler = (name: string, path: string) => {
    setNewMapSaved(true);
    setMapName(name);
    setMapFilePath(path);
    const editor = editorRef.current as TiledPainter;
    const { sourceImage } = mapParams;
    const map = editor.getGWMapInfo(mapName, sourceImage);
    console.log(map);
  };

  const tileMapEditorSetter = (editor: TiledPainter | null) => {
    // if (editor) {
    //   console.log(`tilemap editor instance received!`);
    // }
    editorRef.current = editor;
  };

  return {
    mapName,
    mapFilePath,
    newMapSaved,
    mapSaveHandler,
    mapExportHandler,
    createNewMapHandler,
    tileMapEditorSetter,
  };
};
