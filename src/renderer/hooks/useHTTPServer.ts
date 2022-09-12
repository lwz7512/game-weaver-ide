import { useEffect } from 'react';
import { IpcEvents } from 'ipc-events';
import { checkWorkspacePath } from '../state/storage';

export const useHTTPServer = () => {
  useEffect(() => {
    const { ipcRenderer } = window.electron;
    const port = 8080;
    const gmPath = checkWorkspacePath();
    if (!gmPath) {
      return console.warn('!!! no workspace path in use!');
    }
    ipcRenderer.sendMessage(IpcEvents.START_HTTP_SERVER, [port, gmPath]);
  }, []);
};
