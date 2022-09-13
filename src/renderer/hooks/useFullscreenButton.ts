import { useState } from 'react';
import { IpcEvents } from '../../ipc-events';

const useFullscreenButton = (gamePreviewDefaultURL: string) => {
  const { ipcRenderer } = window.electron;

  const [isWVFullscreen, setIsWVFullscreen] = useState(false);

  const fullScreenOpenHandler = () => {
    const domRect = document.body.getBoundingClientRect();
    ipcRenderer.sendMessage(IpcEvents.OPEN_GAME_VIEW, [
      gamePreviewDefaultURL,
      { width: domRect.width - 56, height: domRect.height },
    ]);
    // lazy showing up close button
    setTimeout(() => setIsWVFullscreen(true), 700);
  };

  const closeFullscreenGameHandler = () => {
    ipcRenderer.sendMessage(IpcEvents.CLOSE_GAME_VIEW, []);
    setIsWVFullscreen(false);
  };

  return {
    isWVFullscreen,
    fullScreenOpenHandler,
    closeFullscreenGameHandler,
  };
};

export default useFullscreenButton;
