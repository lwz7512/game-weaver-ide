import { IpcEvents } from '../../ipc-events';
import { useWorkspaceFolderExists as checkFolder } from './useWorkspaceFile';
import { port } from '../config';

/**
 * check workspace existence to start safely!
 * @param onSpaceGone handler
 * @param onSpaceUnassigned handler
 */
export const useHTTPServer = (
  onSpaceGone: () => void,
  onSpaceUnassigned: () => void
) => {
  const { ipcRenderer } = window.electron;

  const safeToGo = (gmPath: string) => {
    ipcRenderer.sendMessage(IpcEvents.START_HTTP_SERVER, [port, gmPath]);
  };

  checkFolder(onSpaceGone, onSpaceUnassigned, safeToGo);
};
