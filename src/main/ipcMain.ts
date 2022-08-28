// ==================  MESSAGE HANDLING  ==========================
import { ipcMain, dialog } from 'electron';
import { browserWindows } from './createWindow';
import { showOpenDialog } from './dialogs';

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
    return showOpenDialog();
  });
};
// ================== END OF MESSAGE HANDLING  ====================
