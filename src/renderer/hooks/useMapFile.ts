import { useEffect, useState, useRef } from 'react';
import {
  Intent,
  IToasterProps,
  Position,
  Toaster,
  ToastProps,
} from '@blueprintjs/core';

import { kebabCase } from '../utils';
import { IpcEvents } from '../../ipc-events';
import { GameMapXportParams, SaveHistory, GWMAPFILE } from '../config';
import { GWMap } from '../tiled';
import { TiledPainter } from '../tiled/Painter';
import {
  getTilesheetFilePath,
  getTileSheetBy,
  getTilesheetURLBy,
} from '../state/cache';
import { saveMapHistory, getMapHistory } from '../state/storage';
import {
  getLastGWMap,
  setDrawingSession,
  getSessionBy,
} from '../state/session';

export const useMapFile = (
  wokspacePath: string,
  mapParams: GameMapXportParams,
  /** load tilesheet png file, to initialize `mapParams.sourceImage` */
  loadPngFile: (path: string) => Promise<boolean>
) => {
  const { ipcRenderer } = window.electron;

  const toasterRef = useRef<Toaster | null>(null);
  const editorRef = useRef<TiledPainter | null>(null);
  const savedMapRef = useRef<GWMap | null>(null);

  // tab switch
  const [tabType, setTabType] = useState('layers');

  const [mapName, setMapName] = useState('');
  const [newMapSaved, setNewMapSaved] = useState(false);
  const [mapFilePath, setMapFilePath] = useState('');
  const [mapSaveHistory, setMapSaveHistory] = useState<SaveHistory[]>([]);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);

  const { sourceImage, setAllDimension } = mapParams;

  const createNewMapHandler = () => {
    // reset side bar
    setNewMapSaved(false);
    setTabType('layers');
    setMapName('');
    // reset editor
    const editor = editorRef.current as TiledPainter;
    editor.cleanupAll();
    // cleanup loaded map
    savedMapRef.current = null;
  };

  // toast properties
  const toastState: IToasterProps = {
    autoFocus: false,
    canEscapeKeyClear: true,
    position: Position.TOP,
    usePortal: true,
    maxToasts: 1,
  };

  const toasterCallback = (ref: Toaster) => {
    toasterRef.current = ref;
  };

  const addToast = (toast: ToastProps) => {
    if (!toasterRef.current) return;
    // toast.className = '';
    toast.timeout = 3000;
    toasterRef.current.show(toast);
  };

  /**
   * TODO: export map data to phaserjs format...
   */
  const mapExportHandler = () => {
    const editor = editorRef.current as TiledPainter;
    // console.log(`>>> save game map data:`);
    const map = editor.getPhaserMapInfo();
    // console.log(map);
  };

  /**
   * save map to file system...
   *
   * @param name map name
   * @param path json path
   */
  const mapSaveHandler = async (name: string, path: string) => {
    setNewMapSaved(true);
    setMapName(name);
    setMapFilePath(path);
    // save map source path to outside of editor!
    setDrawingSession({ mapFilePath: path });
    // keep map info
    const editor = editorRef.current as TiledPainter;
    const tilesheetFilePath = getTilesheetFilePath(sourceImage);
    editor.setGWMapInfo(name, tilesheetFilePath);
    // serialize map info
    const gwMap = editor.getGWMapInfo();
    // console.log(gwMap);
    const mapSource = JSON.stringify(gwMap);
    const fileName = kebabCase(name);
    const destination = `${wokspacePath}/${fileName}${GWMAPFILE}`;
    await ipcRenderer.invoke(IpcEvents.SAVE_MAP_FILE, destination, mapSource);
    // console.log(`save map success!`);

    saveMapHistory(name, path);
    const files = getMapHistory();
    setMapSaveHistory(files);
    setTabType('history'); // switch to history tab

    addToast({
      icon: 'tick-circle',
      intent: Intent.SUCCESS,
      message: `Map saved at: ${destination}`,
    });
  };

  /**
   * editor instance injection function
   * @param editor
   */
  const tileMapEditorSetter = (editor: TiledPainter | null) => {
    if (!editor) return;
    // console.log(`tilemap editor instance received!`);
    editorRef.current = editor;
    // check cached map
    const savedMap = savedMapRef.current; // only available after click history item
    if (!savedMap) return;
    // get saved or loaded map file source
    const fullPath = getSessionBy('mapFilePath') as string;
    if (!fullPath) return; // if no loaded or saved map do not restore it!

    // rebuild map
    const {
      mapHeight,
      mapWidth,
      layers,
      name,
      tileHeight,
      tileWidth,
      tilesetImage,
    } = savedMap;
    const tilesheetURL = getTilesheetURLBy(tilesetImage);
    const { textures } = getTileSheetBy(tilesheetURL);

    // 3. reset layers manager:
    editor.buildLayersBy(mapWidth, mapHeight, layers);
    // 4. build tiles grid
    editor.setMapTiles(textures);
    // 5. redraw layers tiles inside of editor
    editor.paintSpritesFrom(layers);
    // 6. save loaded map info
    editor.setGWMapInfo(name, tilesetImage);

    setNewMapSaved(true);
    setMapName(name);
    setSelectedMap(name);
    setMapFilePath(fullPath);
    setAllDimension(mapHeight, mapWidth, tileHeight, tileWidth);
  };

  /**
   * load map source file, load tilesheet image file, and reset map fields
   * @param fileName
   * @param fullPath
   * @returns
   */
  const loadMapBy = async (fileName: string, fullPath: string) => {
    setSelectedMap(fileName);
    setMapFilePath(fullPath);
    setDrawingSession({ mapFilePath: fullPath });

    const fileContent = await ipcRenderer.invoke(
      IpcEvents.READ_MAP_FILE,
      fullPath
    );
    if (!fileContent) return;

    const gwMap = JSON.parse(fileContent as string) as GWMap;
    // save it for later render
    savedMapRef.current = gwMap;

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
    // 1. reset game name & dimensions
    setNewMapSaved(true);
    setMapName(name);
    setAllDimension(mapHeight, mapWidth, tileHeight, tileWidth);
  };

  /**
   * check `selectedImage` after tilesheet file loaded,
   * then to build map layers in editor
   */
  useEffect(() => {
    // 0. tilesheet image not loaded, do nothing!
    if (!sourceImage) return console.warn('source image empty!'); // initially empty

    // 1. check cached map
    const lastMap = getLastGWMap();
    if (lastMap) {
      savedMapRef.current = lastMap;
      // console.log(`>>> got the cached last map!`);
    }
    // 2. map source not initialized, do nothing!
    const savedMap = savedMapRef.current; // only available after click history item
    if (!savedMap) return console.warn('saved map null!');

    // 3. sure thing to do some checking work:
    const editor = editorRef.current as TiledPainter;
    if (!editor) {
      // console.warn('>> editor not inited!');
      return;
    }

    const tilesheetFilePath = getTilesheetFilePath(sourceImage);
    const { tilesetImage } = savedMap;
    // check file path the same
    if (tilesetImage !== tilesheetFilePath) {
      // console.warn(`### sourceImage does not match loaded map!`);
      // console.log(`### editor restored to initial!`);
      // restore to new game map state ...
      editor.cleanupAll();
      // reset history deselect!
      setSelectedMap(null);
      createNewMapHandler();
      // return;
    }
  }, [sourceImage]);

  useEffect(() => {
    const files = getMapHistory();
    setMapSaveHistory(files);
  }, []);

  return {
    mapName,
    mapFilePath,
    newMapSaved,
    toastState,
    mapSaveHistory,
    tabType,
    /** map name to be loaded by click history item */
    selectedMap,
    savedGWMap: savedMapRef.current,
    loadMapBy,
    setSelectedMap,
    setTabType,
    toasterCallback,
    mapSaveHandler,
    mapExportHandler,
    createNewMapHandler,
    tileMapEditorSetter,
  };
};
