import { useEffect } from 'react';
import { IpcEvents } from '../../ipc-events';
import { safeActionWithWorkspace } from '../state/storage';

export const useHTTPServer = () => {
  useEffect(() => {
    const { ipcRenderer } = window.electron;
    const port = 8080;
    safeActionWithWorkspace((gmPath) => {
      ipcRenderer.sendMessage(IpcEvents.START_HTTP_SERVER, [port, gmPath]);
    });
  }, []);
};
