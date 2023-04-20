import { useRef } from 'react';
import {
  Intent,
  IToasterProps,
  Position,
  Toaster,
  ToastProps,
} from '@blueprintjs/core';

import { IpcEvents } from '../../ipc-events';
import { useLocalStorage } from './useLocalStorage';
import { cacheLastGameCode, getLastGameCode } from '../state/session';

export const useRightSideBar = (
  selectedGame: string,
  fileName: string,
  getSourceCode: () => string
) => {
  const { ipcRenderer } = window.electron;
  const toasterRef = useRef<Toaster | null>(null);
  const { spacePath } = useLocalStorage();

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
    toast.timeout = 2000;
    toasterRef.current.show(toast);
  };

  const saveMainJS = async () => {
    if (!selectedGame || !fileName) return; // safety check is a must!

    const savedCode = getLastGameCode(selectedGame);
    const filePath = `${spacePath}/${selectedGame}/${fileName}.js`;
    const fileCode = getSourceCode();
    // change check
    if (savedCode.length === fileCode.length) {
      console.warn(`## No code change, no need to save!`);
      return;
    }
    await ipcRenderer.invoke(IpcEvents.SAVE_GAME_FILE, filePath, fileCode);
    // notify
    addToast({
      icon: 'tick-circle',
      intent: Intent.SUCCESS,
      message: `${fileName}.js saved successfully!`,
    });
    // cache to decide if save again later
    cacheLastGameCode(selectedGame, fileCode);
  };

  const toggleDevTools = () => {
    ipcRenderer.invoke(IpcEvents.TOGGLE_DEV_TOOLS);
  };

  return {
    toastState,
    toasterCallback,
    saveMainJS,
    toggleDevTools,
  };
};
