import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const rootApp = createRoot(container || document.body);
rootApp.render(<App />);

// calling IPC exposed from preload script
// window.electron.ipcRenderer.once('ipc-example', (arg) => {
//   // eslint-disable-next-line no-console
//   console.log(arg);
// });
// window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
