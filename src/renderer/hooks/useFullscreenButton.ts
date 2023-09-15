import { useState } from 'react';
import { IpcEvents } from '../../ipc-events';

/**
 * Open webview to enable game running as full screen mode
 * @param gamePreviewDefaultURL game preview address
 * @returns
 */
const useFullscreenButton = (gamePreviewDefaultURL: string) => {
  const { ipcRenderer } = window.electron;

  const [isWVFullscreen, setIsWVFullscreen] = useState(false);

  const fullScreenOpenHandler = (url?: string) => {
    const domRect = document.body.getBoundingClientRect();
    ipcRenderer.sendMessage(IpcEvents.OPEN_GAME_VIEW, [
      url || gamePreviewDefaultURL,
      { width: domRect.width - 56, height: domRect.height },
    ]);
    // lazy showing up close button
    setTimeout(() => setIsWVFullscreen(true), 800);
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
