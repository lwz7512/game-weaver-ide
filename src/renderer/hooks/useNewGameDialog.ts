import { useCallback, useState } from 'react';

import { IpcEvents } from '../../ipc-events';
import appMeta from '../assets/app.json';
import { getTemplateSourceObjects } from './useWorkspaceFile';

export const useNewGameDialog = () => {
  const { ipcRenderer } = window.electron;

  const [isOpen, setIsOpen] = useState(false);
  const handleClose = useCallback(() => setIsOpen(false), []);
  const handleOpen = () => setIsOpen(true);

  const savePathCheckHandler = async (path: string): Promise<boolean> => {
    const result = await ipcRenderer.invoke(IpcEvents.CHECK_DIR_EXISTS, path);
    return !!result;
  };

  const createGameProjectHandler = async (
    template: string, // basic, box2d, ...
    gamePath: string // local path under workspace
  ): Promise<boolean> => {
    const fileObjs = getTemplateSourceObjects(appMeta, template, gamePath);
    const result = await ipcRenderer.invoke(
      IpcEvents.DOWNLOAD_GAME_TEMPLATE,
      fileObjs
    );
    return result as boolean;
  };

  return {
    isOpen,
    handleClose,
    handleOpen,
    savePathCheckHandler,
    createGameProjectHandler,
  };
};
