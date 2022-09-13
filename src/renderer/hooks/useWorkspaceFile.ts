import { useState, useEffect } from 'react';
import { IpcEvents } from 'ipc-events';
import { checkWorkspacePath } from '../state/storage';

export const useWorkspaceMainJS = (path = '/') => {
  const [mainJSCode, setMainJSCode] = useState('//loading game source...');

  useEffect(() => {
    const { ipcRenderer } = window.electron;
    // console.log('>>> to load game space main.js content...');
    const workspace = checkWorkspacePath();
    const fetchMain = async (jsPath: string) => {
      const unknownContent = await ipcRenderer.invoke(
        IpcEvents.LOAD_GAME_MAINJS,
        jsPath
      );
      const mainSource = unknownContent as string;
      setMainJSCode(mainSource);
    };
    if (workspace) {
      fetchMain(`${workspace + path}main.js`);
    } else {
      console.log('### no workspace path saved!');
    }
  }, [path]);

  return { mainJSCode };
};
