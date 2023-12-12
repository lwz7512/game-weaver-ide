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

  /**
   * Open web page in webview layer
   * @param url webpage url
   */
  const fullScreenOpenHandler = (url: string) => {
    const { width, height } = document.body.getBoundingClientRect();
    const viewSize = { width: width - 56, height };
    ipcRenderer.sendMessage(IpcEvents.OPEN_GAME_VIEW, [url, viewSize]);

    // lazy showing up close button
    setTimeout(() => setIsWVFullscreen(true), 800);
  };

  const closeFullscreenGameHandler = () => {
    ipcRenderer.sendMessage(IpcEvents.CLOSE_GAME_VIEW, []);
    setIsWVFullscreen(false);
  };

  const openGameInFullScreen = () => {
    fullScreenOpenHandler(gamePreviewDefaultURL);
  };
  return {
    isWVFullscreen,
    fullScreenOpenHandler,
    openGameInFullScreen,
    closeFullscreenGameHandler,
  };
};

export default useFullscreenButton;
