import { app, dialog } from 'electron';
import * as fs from 'fs-extra';
import * as path from 'path';

export async function showOpenImageDialog(title: string): Promise<string[]> {
  const { filePaths } = await dialog.showOpenDialog({
    title,
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png'] }],
  });

  if (!filePaths || filePaths.length < 1) {
    return [];
  }
  return filePaths;
}

/**
 * Shows the "Open Fiddle" dialog and forwards
 * the path to the renderer
 */
export async function showOpenDialog(title: string): Promise<string[]> {
  const { filePaths } = await dialog.showOpenDialog({
    title,
    properties: ['openDirectory'],
  });

  if (!filePaths || filePaths.length < 1) {
    return [];
  }
  return filePaths;
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

  // cancel
  if (!Array.isArray(filePaths) || filePaths.length === 0) {
    return [];
  }

  // FIXME: do not create gmspace under gmspace
  // @2023/05/02
  const gmSelected = filePaths[0].includes(dir);
  if (gmSelected) {
    const gmspacePosition = filePaths[0].indexOf(dir);
    const originGMSpacePath = filePaths[0].substring(0, gmspacePosition);
    return [`${originGMSpacePath}${dir}`]; // return original gmspace path
  }

  // assume current selected directory is the parent of `gmspace` folder
  const gmspacePath = `${filePaths[0]}${path.sep}${dir}`;
  const gmExisted = fs.existsSync(gmspacePath);
  if (!gmExisted) {
    await fs.mkdir(gmspacePath);
  } else {
    // why create an empty file? placeholder? @2023/05/02
    const placeholderPath = `${gmspacePath}/empty.txt`;
    await fs.writeFile(placeholderPath, '');
  }
  console.log(`### Saved to ${gmspacePath}`);
  return [gmspacePath];
}

export default {};
