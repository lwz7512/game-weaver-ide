// ==================  MESSAGE HANDLING  ==========================
import { ipcMain, dialog, shell } from 'electron';
import {
  browserWindows,
  createView,
  closeView,
  toggleDevTools,
} from './createWindow';
import { showOpenDialog, showSaveDialog, showOpenImageDialog } from './dialogs';
import { IpcEvents } from '../ipc-events';
import { createServer } from './createServer';
import {
  readFile,
  readDirectoriesInSpace,
  readImageToBlob,
  readPngImage,
  downloadFileList,
  checkDirectoryExistence,
  deleteDirectory,
  writeFile,
  fetchRemoteJSON,
  fetchRemoteTextFile,
} from './readFile';

export const setupIpcMainHandler = () => {
  // === handling async calls =====================
  ipcMain.handle('showDialog', (e, message) => {
    return showOpenDialog(message);
  });

  ipcMain.handle(IpcEvents.OPEN_SETTINGS, (_, directory: string) => {
    return showSaveDialog(directory);
  });

  ipcMain.handle(IpcEvents.LOAD_GAME_MAINJS, (_, path: string) => {
    return readFile(path);
  });

  ipcMain.handle(IpcEvents.READ_GAMESPACE_DIRS, (_, path: string) => {
    return readDirectoriesInSpace(path);
  });

  ipcMain.handle(IpcEvents.CHECK_DIR_EXISTS, (_, path: string) => {
    return checkDirectoryExistence(path);
  });

  ipcMain.handle(IpcEvents.DOWNLOAD_GAME_DEMO, (_, fileObjs: []) => {
    return downloadFileList(fileObjs);
  });

  ipcMain.handle(IpcEvents.DOWNLOAD_GAME_TEMPLATE, (_, fileObjs: []) => {
    return downloadFileList(fileObjs);
  });

  ipcMain.handle(IpcEvents.DOWNLOAD_TILESHEETTS, (_, fileObjs: []) => {
    return downloadFileList(fileObjs);
  });

  ipcMain.handle(IpcEvents.DELETE_GAME_FOLDER, (_, path: string) => {
    return deleteDirectory(path);
  });

  ipcMain.handle(IpcEvents.OPEN_FILE_FROM_DIALOG, (_, title: string) => {
    return showOpenImageDialog(title);
  });

  ipcMain.handle(IpcEvents.READ_IMAGE_FILE, (_, imageFilePath: string) => {
    return readImageToBlob(imageFilePath);
  });

  ipcMain.handle(IpcEvents.READ_PNG_IMAGE, (_, imageFilePath: string) => {
    return readPngImage(imageFilePath);
  });

  ipcMain.handle(IpcEvents.FETCH_REMOTE_JSON, (_, jsonFileURL: string) => {
    return fetchRemoteJSON(jsonFileURL);
  });

  ipcMain.handle(IpcEvents.FETCH_REMOTE_TEXT, (_, textFileURL: string) => {
    return fetchRemoteTextFile(textFileURL);
  });

  ipcMain.handle(
    IpcEvents.SAVE_GAME_FILE,
    (_, path: string, content: string) => {
      return writeFile(path, content);
    }
  );

  ipcMain.handle(
    IpcEvents.SAVE_MAP_FILE,
    (_, path: string, content: string) => {
      return writeFile(path, content);
    }
  );

  ipcMain.handle(IpcEvents.READ_MAP_FILE, (_, path: string) => {
    return readFile(path);
  });

  ipcMain.handle(IpcEvents.TOGGLE_DEV_TOOLS, () => {
    return toggleDevTools();
  });

  ipcMain.handle(IpcEvents.OPEN_EXTERNAL_URL, (_, url: string) => {
    shell.openExternal(url);
  });

  // ========= processing message =====================

  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    // console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  ipcMain.on('showNativeMessage', (e, message) => {
    const mainWindow = browserWindows[0];
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, { message: 'Gotit!' });
    }
  });

  ipcMain.on(IpcEvents.OPEN_GAME_VIEW, (e, args: unknown[]) => {
    const url = args[0] as string;
    const size = args[1] as { [key: string]: number };
    createView(url, size.width, size.height);
  });

  ipcMain.on(IpcEvents.CLOSE_GAME_VIEW, closeView);

  ipcMain.on(IpcEvents.START_HTTP_SERVER, (e, args: unknown[]) => {
    const port = args[0] as number;
    const gmPath = args[1] as string;
    // console.log(`>>> prepare to start server from path: ${gmPath} at ${port}`);
    createServer(port, gmPath);
  });

  // Open the given file in the desktop's default manner.
  ipcMain.on(IpcEvents.OPEN_GMSPACE_DIRS, (_, args: unknown[]) => {
    shell.openPath(args[0] as string);
  });
};
// ================== END OF MESSAGE HANDLING  ====================
