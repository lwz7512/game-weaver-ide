/* eslint-disable global-require */
import path from 'path';
import { app, BrowserWindow, shell, BrowserView } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';
import MenuBuilder from './menu';

// Keep a global reference of the window objects, if we don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
export const browserWindows: Array<BrowserWindow | null> = [];

const gameViews: Array<BrowserView | null> = [];

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

export const createWindow = async (isDebug: boolean) => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 760,
    minWidth: 1024,
    minHeight: 640,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webviewTag: true, // allow for webview tag, disabled by default
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  // clear all
  mainWindow.on('closed', () => {
    browserWindows.pop();
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  browserWindows.push(mainWindow);

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Create Game view
 * @param url
 * @param width
 * @param height
 */
export const createView = (url: string, width = 400, height = 300) => {
  const win = browserWindows[0];
  if (win) {
    const view = new BrowserView();
    win.addBrowserView(view);
    view.setBounds({
      x: 0,
      y: 0,
      width,
      height,
    });
    view.webContents.loadURL(url);
    gameViews.push(view);
  }
};

export const closeView = () => {
  const win = browserWindows[0];
  const view = gameViews.shift();
  if (win && view) {
    win.removeBrowserView(view);
  }
};