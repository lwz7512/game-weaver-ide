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
  console.log('>>> Downloading :');
  console.log(url);
  // const path = '/Users/liwenzhi/Downloads/gmspace/main.js';
  fs.outputFileSync(path, ''); // make sure folder/file created
  await pipeline(got.stream(url), fs.createWriteStream(path));
  console.log('## one file Done!');
};

export const downloadFileList = async (fileObjs: FileObj[]) => {
  if (!fileObjs.length) return console.log('#### All done!');

  const headFile = fileObjs.shift() as FileObj;
  await downloadRemoteFile(headFile.url, headFile.path);
  // call self to download next file!
  await downloadFileList(fileObjs);
};
