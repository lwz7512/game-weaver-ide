import { useState, useEffect, useCallback } from 'react';
import { IpcEvents } from '../../ipc-events';
import appMeta from '../assets/app.json';
import { ConfigType, ExampleSource } from '../config/types';
import { safeActionWithWorkspace } from '../state/storage';
import { FileObj } from '../../interfaces';

export const getTemplateSourceObjects = (
  config: ConfigType,
  template: string,
  savePath: string
): FileObj[] => {
  const baseURL = config.baseURL as string;
  const examplesPath = config.examplesPath as string;
  const examples = config.examples as ExampleSource[];
  const sourceFiles = examples.find(
    (example) => example.folder === template
  ) as ExampleSource;
  const fileObjs = sourceFiles.files.map((path) => ({
    url: baseURL + examplesPath + path, // remote url
    path: savePath + path.replace(`/${template}`, ''),
  }));
  return fileObjs;
};

/**
 * Read main.js content of one game folder
 * @param gameFolder game folder under workspace
 * @returns main.js source code
 */
export const useWorkspaceMainJS = (gameFolder: string | undefined) => {
  const [mainJSCode, setMainJSCode] = useState('//loading games...');

  useEffect(() => {
    if (!gameFolder) return; // no game folder specified

    const { ipcRenderer } = window.electron;
    const fetchMain = async (jsPath: string) => {
      // console.log('>>> fetch js:');
      // console.log(jsPath);
      const unknownContent = await ipcRenderer.invoke(
        IpcEvents.LOAD_GAME_MAINJS,
        jsPath
      );
      const mainSource = unknownContent as string;
      // console.log('### got main.js content:');
      // console.log(mainSource);
      if (mainSource) setMainJSCode(mainSource);
    };
    // need a little time to wait for files wrote down?
    // especially for busy machine.
    const lazyHandler = (workspace: string) => {
      setTimeout(() => {
        const jsPath = `${workspace}/${gameFolder}/main.js`;
        fetchMain(jsPath);
      }, 100);
    };
    // fetch main.js under game folder
    safeActionWithWorkspace(lazyHandler);
  }, [gameFolder]);

  return { mainJSCode };
};

const getDemoSourceObjects = (
  config: ConfigType,
  workspacePath: string
): FileObj[] => {
  const baseURL = config.baseURL as string;
  const examplesPath = config.examplesPath as string;
  const examples = config.examples as ExampleSource[];
  const demo = examples[0];
  const fileObjs = demo.files.map((path) => ({
    url: baseURL + examplesPath + path,
    path: workspacePath + path,
  }));
  return fileObjs;
};

/**
 * Read games under workspace and download `demo` if no game exists.
 * @param config global config
 * @returns games meta list
 */
export const useGMSpaceFolders = () => {
  // FIXME: should save game meta objects: { folder, title, icon, desciption ...}
  // returned from main process...
  const [gameFolders, setGameFolders] = useState<string[]>([]);

  const fetchGamesInSpace = useCallback(async (workspace: string) => {
    const { ipcRenderer } = window.electron;
    // step1: check gmspace
    const folders = (await ipcRenderer.invoke(
      IpcEvents.READ_GAMESPACE_DIRS,
      workspace
    )) as string[];
    // console.log(folders);

    if (folders.length) {
      return setGameFolders(folders);
    }

    // step2: download demo game to empty workspace if run IDE first
    const files = getDemoSourceObjects(appMeta, workspace);
    // download remote demo...
    await ipcRenderer.invoke(IpcEvents.DOWNLOAD_GAME_DEMO, files);
    // refresh side panel
    setGameFolders(['demo']); // add demo folder to display at sidebar
  }, []);

  const refreshGamesInSpace = () => {
    safeActionWithWorkspace((workspace) => {
      fetchGamesInSpace(workspace);
    });
  };

  useEffect(() => {
    // fetch game folders under workspace
    safeActionWithWorkspace((gmPath) => {
      fetchGamesInSpace(gmPath);
    });
  }, [fetchGamesInSpace]);

  return { gameFolders, refreshGamesInSpace };
};
