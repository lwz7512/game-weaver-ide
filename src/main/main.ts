/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app } from 'electron';
import { createWindow } from './createWindow';
import { stopServer } from './createServer';
import { setupIpcMainHandler } from './ipcMain';

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

/**
 * Add event listeners...
 */
// app.on('before-quit', onBeforeQuit);
app.on('window-all-closed', () => {
  stopServer();
  // FIXME: In order to kill http server immediately after closed window,
  // here we need quit main process after the `stopServer`.
  app.quit();
});

/**
 * available only in Mac os
 */
// app.on('activate', () => {
//   console.log('>>> app ReActivated, window count: ');
//   if (!browserWindows.length) createWindow(isDebug);
// });

app
  .whenReady()
  .then(() => {
    createWindow(isDebug);
    setupIpcMainHandler();
  })
  .catch(console.log);
