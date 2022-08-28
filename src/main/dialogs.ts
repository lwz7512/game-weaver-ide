import { app, dialog } from 'electron';
import * as fs from 'fs-extra';
import { IpcEvents } from '../ipc-events';

/**
 * Shows the "Open Fiddle" dialog and forwards
 * the path to the renderer
 */
export async function showOpenDialog(title: string): Promise<string[]> {
  const { filePaths } = await dialog.showOpenDialog({
    title,
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
export async function showSaveDialog(dir = 'gmspace'): Promise<string[]> {
  // We want to save to a folder, so we'll use an open dialog here
  const filePaths = dialog.showOpenDialogSync({
    buttonLabel: 'Save here',
    properties: ['openDirectory', 'createDirectory'],
    title: `Save Workspace ${dir}`,
  });

  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    return [];
  }

  const gmspacePath = `${filePaths[0]}/${dir}`;
  const gmExisted = fs.existsSync(gmspacePath);
  if (!gmExisted) {
    await fs.mkdir(gmspacePath);
  } else {
    await fs.writeFile(`${gmspacePath}/empty.txt`, '...');
  }
  console.log(`### Saved to ${gmspacePath}`);
  return [gmspacePath];
}

export default {};
