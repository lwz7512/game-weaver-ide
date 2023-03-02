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
  setDrawingSession,
  getSessionBy,
} from '../state/session';

export const useMapFile = (
  wokspacePath: string,
  selectedImage: string,
  onDimensionChange: (mh: number, mw: number, th: number, tw: number) => void,
  /** load tilesheet png file, to initialize `mapParams.sourceImage` */
  loadPngFile: (path: string) => Promise<boolean>
) => {
  const { ipcRenderer } = window.electron;

  const toasterRef = useRef<Toaster | null>(null);
  const editorRef = useRef<TiledPainter | null>(null);

  // tab switch
  const [tabType, setTabType] = useState('layers');
  const [mapName, setMapName] = useState('');
  const [newMapSaved, setNewMapSaved] = useState(false);
  const [mapFilePath, setMapFilePath] = useState('');
  const [mapSaveHistory, setMapSaveHistory] = useState<SaveHistory[]>([]);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [editorInjected, setEditorInjected] = useState(false);

  const addToast = (toast: ToastProps) => {
    if (!toasterRef.current) return;
    // toast.className = '';
    toast.timeout = 3000;
    toasterRef.current.show(toast);
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
   * TODO: export map data to phaserjs format...
   */
  const mapExportHandler = () => {
    const editor = editorRef.current as TiledPainter;
    // console.log(`>>> save game map data:`);
    const map = editor.getPhaserMapInfo();
    // console.log(map);
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

  /**
   * save map to file system...
   *
   * @param name map name
   * @param path json path
   */
  const mapSaveHandler = async (name: string, path: string) => {
    // keep map info
    const editor = editorRef.current as TiledPainter;
    const tilesheetFilePath = getTilesheetFilePath(selectedImage);
    editor.setGWMapInfo(name, tilesheetFilePath);
    // serialize map info
    const gwMap = editor.getGWMapInfo();
    // console.log(gwMap);
    addGWMapRecord(gwMap);

    // cache latest map!
    const mapSource = JSON.stringify(gwMap);
    const fileName = kebabCase(name);
    const destination = `${wokspacePath}/${fileName}${GWMAPFILE}`;
    await ipcRenderer.invoke(IpcEvents.SAVE_MAP_FILE, destination, mapSource);
    console.log(`save map success!`);

    saveMapHistory(name, path);
    const files = getMapHistory();
    setMapSaveHistory(files);
    setTabType('history'); // switch to history tab

    setNewMapSaved(true);
    setMapName(name);
    setMapFilePath(path);
    // save map source path to outside of editor!
    setDrawingSession({ mapFilePath: path });

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
  };

  useEffect(() => {
    // console.log(`>> 1. running [] hook...`);
    const files = getMapHistory();
    setMapSaveHistory(files);
  }, []);

  /**
   * check `selectedImage` after tilesheet file loaded,
   * then to build map layers in editor
   */
  useEffect(() => {
    console.log(`>>> 2. running sourceImage hook...`);
    console.log(selectedImage);
    // 1. tilesheet image not loaded, do nothing!
    if (!selectedImage) {
      // console.warn('source image empty!'); // initially empty
      return;
    }

    const tilesheetFilePath = getTilesheetFilePath(selectedImage);
    // 2. map source not initialized, do nothing!
    const savedMap = getLastGWMap(); // only available after click history item
    if (!savedMap) return console.warn('saved map null!');

    // 3. sure thing to do some checking work:
    const { tilesetImage, name } = savedMap;
    const editor = editorRef.current as TiledPainter;
    // check file path the same
    if (tilesetImage !== tilesheetFilePath) {
      // restore to new game map state ...
      editor && editor.cleanupAll();
      // reset history deselect!
      setSelectedMap(null);
      createNewMapHandler();
      return;
    }

    // get saved or loaded map file source
    const fullPath = getSessionBy('mapFilePath') as string;
    // if no loaded or saved map do not restore it!
    if (!fullPath) return console.warn('>>> mapFilePath empty!');

    // rebuild map
    setNewMapSaved(true);
    setMapName(name);
    setSelectedMap(name);
    setMapFilePath(fullPath);
  }, [selectedImage]);

  /**
   * draw layers in editor
   */
  useEffect(() => {
    if (!editorInjected) return;
    // console.log(`>>> 4. start to build map layers...`);
    // check latest map to render!
    const savedMap = getLastGWMap();
    if (!savedMap) {
      // console.warn('saved map null!');
      return;
    }

    const { mapHeight, mapWidth, layers, name, tilesetImage } = savedMap;

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
  }, [editorInjected]);

  return {
    mapName,
    mapFilePath,
    newMapSaved,
    toastState,
    mapSaveHistory,
    tabType,
    /** map name to be loaded by click history item */
    selectedMap,
    savedGWMap: getLastGWMap(),
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
