export enum IpcEvents {
  OPEN_SETTINGS = 'OPEN_SETTINGS',
  OPEN_GAME_VIEW = 'OPEN_GAME_VIEW',
  CLOSE_GAME_VIEW = 'CLOSE_GAME_VIEW',
  START_HTTP_SERVER = 'START_HTTP_SERVER',
  LOAD_GAME_MAINJS = 'LOAD_GAME_MAINJS',
  // more ...
}

export const ipcMainEvents = [];
export const ipcRendererEvents = [];
export const WEBCONTENTS_READY_FOR_IPC_SIGNAL =
  'WEBCONTENTS_READY_FOR_IPC_SIGNAL';
