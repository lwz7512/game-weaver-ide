// ==================  MESSAGE HANDLING  ==========================
import { ipcMain, dialog } from 'electron';
import { browserWindows, createView, closeView } from './createWindow';
import { showOpenDialog, showSaveDialog } from './dialogs';
import { IpcEvents } from '../ipc-events';
import { createServer } from './createServer';

export const setupIpcMainHandler = () => {
  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    // console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  ipcMain.on('showDialog', (e, message) => {
    const mainWindow = browserWindows[0];
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, { message: 'Gotit!' });
    }
  });

  ipcMain.handle('showDialog', (e, message) => {
    return showOpenDialog(message);
  });

  ipcMain.handle(IpcEvents.OPEN_SETTINGS, (e, message) => {
    return showSaveDialog(message);
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
    console.log(`>>> prepare to start server from path: ${gmPath} at ${port}`);
    createServer(port, gmPath);
  });
};
// ================== END OF MESSAGE HANDLING  ====================
