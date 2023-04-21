import * as pathModule from 'node:path';
import fs from 'fs-extra';
import { promisify } from 'node:util';
import stream from 'node:stream';
import got from 'got';
import { FileObj, PNGFile } from '../interfaces';
import { PNG } from './png';

const pipeline = promisify(stream.pipeline);

/**
 * for github reposiitory files
 */
const remoteFileCache: { [key: string]: Buffer } = {};

/**
 * for local exsited image file cache
 */
const localImageFileCache: { [key: string]: Buffer } = {};

/**
 * read a png file bytes as blob
 * @param path png file path
 * @returns blob
 */
export const readImageToBlob = (path: string): Buffer | null => {
  const cachedBlob = localImageFileCache[path];
  if (cachedBlob) return localImageFileCache[path];

  if (!fs.existsSync(path)) return null;

  const buffer = fs.readFileSync(path);
  localImageFileCache[path] = buffer; // cache it!

  return buffer;
};

/**
 * Get png file blogo and dimension
 *
 * @param path png file path
 * @returns
 */
export const readPngImage = (path: string): PNGFile | null => {
  // check cache first
  const cachedBlob = localImageFileCache[path];
  if (cachedBlob) {
    const dimension = PNG.calculate(cachedBlob);
    return {
      buffer: cachedBlob,
      width: dimension.width || 0,
      height: dimension.height || 0,
    };
  }
  // then validate existence
  if (!fs.existsSync(path)) return null;

  const buffer = fs.readFileSync(path); // got it!
  localImageFileCache[path] = buffer; // cache it!
  const dimension = PNG.calculate(buffer);
  console.log(`======== PNG DEMENSION RESYLT ======`);
  console.log(`png width is: ${dimension.width}`);
  console.log(`png height is: ${dimension.height}`);

  return {
    buffer,
    width: dimension.width || 0,
    height: dimension.height || 0,
  };
};

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
  const ignoreDotFolders = folders.filter(
    (folder) => !folder.name.startsWith('.')
  );
  return ignoreDotFolders
    .map((folder) => {
      const fullFolderPath = pathModule.join(
        pathModule.resolve(path),
        folder.name
      );
      const stats = fs.statSync(fullFolderPath);
      return { name: folder.name, ctimeMs: stats.ctimeMs };
    })
    .sort((a, b) => {
      return b.ctimeMs - a.ctimeMs; // descending order, latest first
    })
    .map((item) => item.name);
};

export const downloadRemoteFile = async (url: string, path: string) => {
  // NOTE: this make sure folder/file created to enable stream writing
  fs.outputFileSync(path, '');

  // prepare write stream
  const fstream = fs.createWriteStream(path);

  // NOTE: cache download file in case of reuse!
  if (remoteFileCache[url]) {
    // reuse cached chunks
    const buffers = remoteFileCache[url];
    return fstream.write(buffers);
  }
  // cache Buffer data
  const chunks: Uint8Array[] = [];
  const req = got.stream(url);
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    remoteFileCache[url] = Buffer.concat(chunks);
  });
  // running pipeline ...
  await pipeline(req, fstream);
  // console.log('## Downloaded file: ');
  // console.log(url);
  return true;
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

export const deleteDirectory = (path: string) => {
  fs.rmSync(path, { recursive: true });
  return true;
};

export const writeFile = (path: string, content: string) => {
  fs.writeFileSync(path, content);
  return true;
};
