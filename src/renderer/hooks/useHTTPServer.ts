import { useEffect } from 'react';
import { IpcEvents } from '../../ipc-events';
import { safeActionWithWorkspace } from '../state/storage';
import { port } from '../config';

export const useHTTPServer = () => {
  useEffect(() => {
    const { ipcRenderer } = window.electron;
    safeActionWithWorkspace((gmPath) => {
      ipcRenderer.sendMessage(IpcEvents.START_HTTP_SERVER, [port, gmPath]);
    });
  }, []);
};
