import fs from 'fs-extra';
import { promisify } from 'node:util';
import stream from 'node:stream';
import got from 'got';
import { FileObj } from '../interfaces';

const pipeline = promisify(stream.pipeline);

/**
 * Read javascript file source code content
 * @param path main.js path
 * @returns string or null
 */
export const readFile = (path: string): string | null => {
  const exist = fs.existsSync(path);
  if (exist) {
    return fs.readFileSync(path).toString();
  }
  return null;
};

/**
 * Read game folders in `gmspace` folder
 * @param path gmspace in local environment
 * @returns
 */
export const readDirectoriesInSpace = (path: string): string[] => {
  const entries = fs.readdirSync(path, { withFileTypes: true });
  const folders = entries.filter((item) => item.isDirectory());
  return folders.map((item) => item.name);
};

export const downloadRemoteFile = async (url: string, path: string) => {
  // NOTE: this make sure folder/file created to enable stream writing
  fs.outputFileSync(path, '');
  await pipeline(got.stream(url), fs.createWriteStream(path));
  console.log('## one file Done!');
};

export const downloadFileList = async (fileObjs: FileObj[]) => {
  if (!fileObjs.length) {
    console.log('#### All done!');
    return true;
  }
  const headFile = fileObjs.shift() as FileObj;
  await downloadRemoteFile(headFile.url, headFile.path);
  // call self to download next file!
  await downloadFileList(fileObjs);

  return true;
};

export const checkDirectoryExistence = (path: string): boolean => {
  return fs.existsSync(path);
};
