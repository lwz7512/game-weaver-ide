import { useEffect, useState, useRef } from 'react';

import {
  Intent,
  IToasterProps,
  Position,
  Toaster,
  ToastProps,
} from '@blueprintjs/core';

import { IpcEvents } from '../../ipc-events';
import { GameMapXportParams, SaveHistory, GWMAPFILE } from '../config';
import { GWMap } from '../tiled';
import { TiledPainter } from '../tiled/Painter';
import { getTilesheetFilePath } from '../state/cache';
import { saveMapHistory, getMapHistory } from '../state/storage';
import { kebabCase } from '../utils';

export const useMapFile = (
  wokspacePath: string,
  mapParams: GameMapXportParams,
  loadPngFile: (path: string) => void
) => {
  const { ipcRenderer } = window.electron;

  const toasterRef = useRef<Toaster | null>(null);

  // tab switch
  const [tabType, setTabType] = useState('layers');

  const [mapName, setMapName] = useState('');
  const [newMapSaved, setNewMapSaved] = useState(false);
  const [mapFilePath, setMapFilePath] = useState('');
  const [mapSaveHistory, setMapSaveHistory] = useState<SaveHistory[]>([]);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);

  const editorRef = useRef<TiledPainter | null>(null);

  const createNewMapHandler = () => {
    setNewMapSaved(false);
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

    const editor = editorRef.current as TiledPainter;
    const { sourceImage } = mapParams;
    const tilesheetFilePath = getTilesheetFilePath(sourceImage);
    const gwMap = editor.getGWMapInfo(name, tilesheetFilePath);
    // console.log(map);
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
    // if (editor) {
    //   console.log(`tilemap editor instance received!`);
    // }
    editorRef.current = editor;
  };

  const loadMapBy = async (name: string, path: string) => {
    setSelectedMap(name);
    // console.log(`>> load map file: ${path}`);
    const fileContent = await ipcRenderer.invoke(IpcEvents.READ_MAP_FILE, path);
    if (!fileContent) return;
    const gwMap = JSON.parse(fileContent as string) as GWMap;
    // console.log(gwMap);
    const tilesheetFilePath = gwMap.tilesetImage;
    console.log(`>>> loading tilesheet file: ${tilesheetFilePath}`);
    tilesheetFilePath && loadPngFile(tilesheetFilePath);
  };

  useEffect(() => {
    const files = getMapHistory();
    console.log(files);
    setMapSaveHistory(files);
  }, []);

  return {
    mapName,
    mapFilePath,
    newMapSaved,
    toastState,
    mapSaveHistory,
    tabType,
    selectedMap,
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
