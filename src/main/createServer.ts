import { ipcRenderer } from 'electron';
import http from 'http';
import statik from 'node-static';
import fs from 'fs-extra';

type ServerProps = {
  server: http.Server | null;
  active: boolean;
};

const serverInstance: ServerProps = {
  server: null,
  active: false,
};

const onListening = (
  instance: http.Server,
  port: number,
  workspacePath: string
) => {
  console.log(`### Server Started @ ${port} ###`);
  serverInstance.active = true;
  serverInstance.server = instance;
  // check index.html existence
  const indexFile = `${workspacePath}/index.html`;
  if (fs.existsSync(indexFile)) return;
  console.log('### Create index.html placeholder!');
  const head = `<head><title>Empty HTML</title></head>`;
  const message = `loading default game...`;
  const style = `background-color: black; color: rgb(109,232,97);`;
  const body = `<body style="${style}">${message}</body>`;
  const indexHTML = `<html>${head}${body}</html>`;
  fs.outputFileSync(indexFile, indexHTML);
};

const onStop = () => {
  console.log('### server stopped!');
  serverInstance.active = false;
  serverInstance.server = null;
};

export const createServer = (
  port = 8080,
  workspacePath = '/Users/liwenzhi/games/gmspace'
) => {
  // TODO: check port in use ...
  // if 8080 in use, send message through `ipcRenderer`

  if (serverInstance.active) return;

  console.log('>>> Starting http server ...');
  const file = new statik.Server(workspacePath);
  const server: http.Server = http
    .createServer((req, res) => {
      req
        .addListener('end', () => {
          file.serve(req, res); // Serve files!
        })
        .resume();
    })
    .listen(port)
    .addListener('listening', () => onListening(server, port, workspacePath))
    .addListener('close', onStop)
    .addListener('error', (error) => console.log(error));
};

export const stopServer = () => {
  if (!serverInstance.active) {
    return console.log('### server not started!');
  }
  if (serverInstance.server) {
    console.log('>>> stopping http server...');
    serverInstance.server.close();
    return true;
  }
  return false;
};
