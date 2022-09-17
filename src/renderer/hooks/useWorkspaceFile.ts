import { useState, useEffect } from 'react';
import { IpcEvents } from '../../ipc-events';
import { ConfigType, ExampleSource } from '../config/types';
import { safeActionWithWorkspace } from '../state/storage';
import { FileObj } from '../../interfaces';

export const useWorkspaceMainJS = (gameFolder: string | undefined) => {
  const [mainJSCode, setMainJSCode] = useState('//loading games...');

  useEffect(() => {
    if (!gameFolder) return; // no game folder specified

    const { ipcRenderer } = window.electron;
    const fetchMain = async (jsPath: string) => {
      const unknownContent = await ipcRenderer.invoke(
        IpcEvents.LOAD_GAME_MAINJS,
        jsPath
      );
      const mainSource = unknownContent as string;
      if (mainSource) setMainJSCode(mainSource);
    };
    // fetch main.js under game folder
    safeActionWithWorkspace((workspace) => {
      fetchMain(`${workspace}/${gameFolder}/main.js`);
    });
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

export const useGMSpaceFolders = (config: ConfigType) => {
  const [gameFolders, setGameFolders] = useState<string[]>([]);

  useEffect(() => {
    const { ipcRenderer } = window.electron;

    const fetchGamesInSpace = async (workspace: string) => {
      // step1: check gmspace
      const folders = (await ipcRenderer.invoke(
        IpcEvents.READ_GAMESPACE_DIRS,
        workspace
      )) as string[];
      // console.log(folders);

      if (folders.length) {
        return setGameFolders(folders);
      }

      // step2: download demo game
      const files = getDemoSourceObjects(config, workspace);
      // download remote demo...
      await ipcRenderer.invoke(IpcEvents.DOWNLOAD_GAME_DEMO, files);
      // refresh side panel
      setGameFolders(['demo']); // add demo folder to display at sidebar
    };
    // fetch game folders under workspace
    safeActionWithWorkspace((gmPath) => {
      fetchGamesInSpace(gmPath);
    });
  }, [config]);

  return { gameFolders };
};
