import { useEffect, useState, useRef } from 'react';
import { Intent, ToastProps } from '@blueprintjs/core';

import { kebabCase } from '../utils';
import { IpcEvents } from '../../ipc-events';
import { SaveHistory, GWMAPFILE } from '../config';
import { GWMap } from '../tiled';
import { TiledPainter } from '../tiled/Painter';
import {
  getTilesheetFilePath,
  getTileSheetBy,
  getTilesheetURLBy,
} from '../state/cache';
import { saveMapHistory, getMapHistory } from '../state/storage';
import {
  addGWMapRecord,
  clearLastMap,
  getLastGWMap,
  getLastOpenGame,
} from '../state/session';

export const useMapFile = (
  wokspacePath: string,
  selectedImage: string,
  onDimensionChange: (mh: number, mw: number, th: number, tw: number) => void,
  /** load tilesheet png file, to initialize `mapParams.sourceImage` */
  loadPngFile: (path: string) => Promise<boolean>,
  addToast: (toast: ToastProps) => void
) => {
  const { ipcRenderer } = window.electron;

  const editorRef = useRef<TiledPainter | null>(null);

  // tab switch
  const [tabType, setTabType] = useState('layers');
  // map name displayed at the top of widget
  const [mapName, setMapName] = useState('');
  const [newMapSaved, setNewMapSaved] = useState(false);
  const [mapFilePath, setMapFilePath] = useState('');
  const [mapSaveHistory, setMapSaveHistory] = useState<SaveHistory[]>([]);
  // map item seleted in history list
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [editorInjected, setEditorInjected] = useState(false);
  // default export to same folder of tilesheet image
  const lastGameSelected = getLastOpenGame();
  const [gameToExport, setGameToExport] = useState(
    lastGameSelected || 'default'
  );

  const onExportPathChange = (game: string) => {
    setGameToExport(game);
  };

  /**
   * copy map keys to clickboard
   */
  const copyNamesHandler = () => {
    const editor = editorRef.current as TiledPainter;
    const fileName = kebabCase(mapName);
    const tilesheetFilePath = getTilesheetFilePath(selectedImage);
    const tilesheetFileNameWidthSuffix = tilesheetFilePath.split('/').pop();
    const tilesheetFileName = tilesheetFileNameWidthSuffix?.split('.')[0];
    const { layers } = editor.getPhaserMapInfo();
    const layerNames = layers.map((l) => l.name);
    const keyNames = `
    /**
      tilemap_key: ${mapName}
      json_file_path: ./assets/${fileName}.json
      tilesheet_image_path: ./assets/${tilesheetFileNameWidthSuffix}
      tileset_name: ${tilesheetFileName}
      layers: 
        ${layerNames.join('\n        ')}
    */`;
    // copy to clipboard
    navigator.clipboard.writeText(keyNames);
    addToast({
      icon: 'tick-circle',
      intent: Intent.SUCCESS,
      message: `Map key names for PhaserJS game copied to clipboard!`,
    });
  };

  const createNewMapHandler = () => {
    // reset side bar
    setMapName('');
    setTabType('layers');
    setNewMapSaved(false);
    setSelectedMap(null);
    // reset editor
    const editor = editorRef.current;
    editor && editor.cleanupAll();
    clearLastMap();
  };

  /**
   * export map data to phaserjs format...
   * write tileset image path with relative path...
   */
  const mapExportHandler = async () => {
    if (!mapName) return;

    if (!wokspacePath) {
      addToast({
        icon: 'small-info-sign',
        intent: Intent.WARNING,
        message: `No workspace assigned!`,
      });
      return;
    }

    const editor = editorRef.current as TiledPainter;
    const phaserMap = editor.getPhaserMapInfo();
    const fileName = kebabCase(mapName);
    const tilesheetFilePath = getTilesheetFilePath(selectedImage);
    const tilesheetFolders = tilesheetFilePath.split('/').slice(0, -1);
    const tilesheetFolder = tilesheetFolders.join('/');
    const defaultExportPath = `${tilesheetFolder}/${fileName}.json`; // default path
    const gameAssetsPath = `${wokspacePath}/${gameToExport}/assets/${fileName}.json`;
    const jsonFilePath =
      gameToExport === 'default' ? defaultExportPath : gameAssetsPath;
    console.log(`## game json map export to:`);
    console.log(jsonFilePath);
    // == export to json string ==
    const jsonFileContent = JSON.stringify(phaserMap);
    // const jsonFileContent = JSON.stringify(phaserMap, null, 2);
    // console.log(phaserMap);
    await ipcRenderer.invoke(
      IpcEvents.SAVE_MAP_FILE,
      jsonFilePath,
      jsonFileContent
    );
    // console.log(`save map exported!`);
    addToast({
      icon: 'tick-circle',
      intent: Intent.SUCCESS,
      message: `Map exported at: ${jsonFilePath}`,
    });
  };

  /**
   * editor instance injection function
   * @param editor
   */
  const tileMapEditorSetter = (editor: TiledPainter | null) => {
    if (!editor) {
      // console.warn(`>> got editor null!`);
      return;
    }
    // console.log(`## tilemap editor instance received!`);
    editorRef.current = editor;
    setEditorInjected(true);
  };

  /**
   * save map to file system exposed to `MapCreateWidget`
   *
   * @param name map name
   * @param path json path
   */
  const mapSaveHandler = async (name: string, path: string) => {
    if (!wokspacePath) {
      addToast({
        icon: 'small-info-sign',
        intent: Intent.WARNING,
        message: `No workspace assigned!`,
      });
      return;
    }
    // keep map info
    const editor = editorRef.current as TiledPainter;
    const tilesheetFilePath = getTilesheetFilePath(selectedImage);
    editor.setGWMapInfo(name, tilesheetFilePath);
    editor.setGWMapSource(path);

    // serialize map info
    const gwMap = editor.getGWMapInfo();
    const gwMapWithPath = { ...gwMap, mapFilePath: path };
    // console.log(gwMap);
    // add to history
    addGWMapRecord(gwMapWithPath);

    // cache latest map!
    const mapSource = JSON.stringify(gwMapWithPath);
    const fileName = kebabCase(name);
    const destination = `${wokspacePath}/${fileName}${GWMAPFILE}`;
    await ipcRenderer.invoke(IpcEvents.SAVE_MAP_FILE, destination, mapSource);
    // console.log(`save map success!`);

    saveMapHistory(name, path);
    const files = getMapHistory();
    setMapSaveHistory(files);
    setTabType('history'); // switch to history tab

    setNewMapSaved(true);
    setMapName(name);
    setMapFilePath(path);

    addToast({
      icon: 'tick-circle',
      intent: Intent.SUCCESS,
      message: `Map saved at: ${destination}`,
    });
  };

  /**
   * load map source file, load tilesheet image file, and reset map fields
   * @param fileName
   * @param fullPath
   * @returns
   */
  const loadMapBy = async (_: string, fullPath: string) => {
    const fileContent = await ipcRenderer.invoke(
      IpcEvents.READ_MAP_FILE,
      fullPath
    );
    if (!fileContent) return;

    const gwMap = JSON.parse(fileContent as string) as GWMap;
    // === save it for later load ===
    addGWMapRecord(gwMap);

    // 0. check tilesheet file existence
    const tilesheetFilePath = gwMap.tilesetImage;
    // console.log(`>>> loading tilesheet file: ${tilesheetFilePath}`);
    if (!tilesheetFilePath) return console.warn(`>>> no tilesheet image!`);
    const loadResult = await loadPngFile(tilesheetFilePath);
    if (!loadResult) {
      return console.warn(`>>> tile sheet png file doesnt exists!`);
    }

    // go on to paint map layers and build layer ...
    const { mapHeight, mapWidth, tileHeight, tileWidth, name } = gwMap;
    onDimensionChange(mapHeight, mapWidth, tileHeight, tileWidth);
    // 1. reset game name & dimensions
    setNewMapSaved(true);
    setMapName(name);
    setEditorInjected(false);
    setSelectedMap(name);
    setMapFilePath(gwMap.mapFilePath);
  };

  useEffect(() => {
    // console.log(`>> 1. running [] hook...`);
    const files = getMapHistory();
    setMapSaveHistory(files);
  }, []);

  /**
   * check `selectedImage` after tilesheet file loaded,
   * set map dimension widget
   */
  useEffect(() => {
    // console.log(`>>> 2. running sourceImage hook...`);
    // console.log(selectedImage);
    // 1. tilesheet image not loaded, do nothing!
    if (!selectedImage) {
      // console.warn('source image empty!'); // initially empty
      return;
    }

    // 2. map source not initialized, do nothing!
    const savedMap = getLastGWMap(); // only available after click history item
    if (!savedMap) {
      // console.warn('saved map null!');
      return;
    }

    // 3. safe to set map dimension UI
    const { tilesetImage, name } = savedMap;
    // rebuild map
    setNewMapSaved(true);
    setMapName(name);
    setSelectedMap(name);
    setMapFilePath(savedMap.mapFilePath);

    // 4. last not least, handle tilesheet switching
    const editor = editorRef.current as TiledPainter;
    const tilesheetFilePath = getTilesheetFilePath(selectedImage);
    // check file path the same
    if (tilesetImage !== tilesheetFilePath) {
      // restore to new game map state ...
      editor && editor.cleanupAll();
      // reset history deselect!
      setSelectedMap(null);
      createNewMapHandler();
    }
  }, [selectedImage]);

  /**
   * draw layers in editor from last saved map in history
   */
  useEffect(() => {
    if (!editorInjected) return;
    // console.log(`>>> 3. start to build map layers...`);
    // check latest map to render!
    const savedMap = getLastGWMap();
    if (!savedMap) {
      // console.warn('saved map null!');
      return;
    }

    const {
      mapHeight,
      mapWidth,
      layers,
      name,
      tilesetImage,
      mapFilePath: filePath,
    } = savedMap;

    const tilesheetURL = getTilesheetURLBy(tilesetImage);
    const { textures } = getTileSheetBy(tilesheetURL);
    const editor = editorRef.current as TiledPainter;
    if (!editor) {
      console.warn('>> editor not inited!');
      return;
    }
    // 3. reset layers manager:
    editor.buildLayersBy(mapWidth, mapHeight, layers);
    // 4. build tiles grid
    editor.setMapTiles(textures);
    // 5. redraw layers tiles inside of editor
    editor.paintSpritesFrom(layers);
    // 6. save loaded map info
    editor.setGWMapInfo(name, tilesetImage);
    // 7. save source path
    editor.setGWMapSource(filePath);
  }, [editorInjected]);

  return {
    gameToExport,
    mapName,
    mapFilePath,
    newMapSaved,
    mapSaveHistory,
    tabType,
    /** map name to be loaded by click history item */
    selectedMap,
    savedGWMap: getLastGWMap(),
    loadMapBy,
    setSelectedMap,
    setTabType,
    mapSaveHandler,
    mapExportHandler,
    createNewMapHandler,
    copyNamesHandler,
    tileMapEditorSetter,
    onExportPathChange,
  };
};
