import http from 'http';
import statik from 'node-static';

type ServerProps = {
  server: http.Server | null;
  active: boolean;
};

const serverInstance: ServerProps = {
  server: null,
  active: false,
};

const onListening = (instance: http.Server, port: number) => {
  console.log(`### server started @ ${port} ###`);
  serverInstance.active = true;
  serverInstance.server = instance;
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
  if (serverInstance.active) return;
  console.log('>>> starting http server ...');
  const file = new statik.Server(workspacePath);
  const server: http.Server = http
    .createServer((req, res) => {
      req
        .addListener('end', () => {
          //
          // Serve files!
          //
          file.serve(req, res);
        })
        .resume();
      // res.writeHead(200, { 'Content-Type': 'text/plain' });
      // res.write('Hello World!');
      // res.end();
    })
    .listen(port)
    .addListener('listening', () => onListening(server, port))
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
