import { app, dialog } from 'electron';

import { IpcEvents } from '../ipc-events';
// import { ipcMainManager, currentWindow } from './ipc';

/**
 * Shows the "Open Fiddle" dialog and forwards
 * the path to the renderer
 */
export async function showOpenDialog(): Promise<string[]> {
  const { filePaths } = await dialog.showOpenDialog({
    title: 'Open Fiddle',
    properties: ['openDirectory'],
  });

  // console.log(filePaths);

  if (!filePaths || filePaths.length < 1) {
    return [];
  }
  return filePaths;

  // TODO: create workspace folder: gwspace

  // app.addRecentDocument(filePaths[0]);
}

/**
 * Shows the "Save Fiddle" dialog and forwards
 * the path to the renderer
 */
export async function showSaveDialog(event?: IpcEvents, as?: string) {
  // We want to save to a folder, so we'll use an open dialog here
  const filePaths = dialog.showOpenDialogSync({
    buttonLabel: 'Save here',
    properties: ['openDirectory', 'createDirectory'],
    title: `Save Fiddle${as ? ` as ${as}` : ''}`,
  });

  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    return;
  }

  console.log(`Asked to save to ${filePaths[0]}`);
}

export default {};
