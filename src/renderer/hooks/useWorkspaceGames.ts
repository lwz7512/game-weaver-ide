import { useState, useEffect } from 'react';
import { IpcEvents } from '../../ipc-events';
import { gamePreviewDefaultURL as homepage, ConfigType } from '../config';
import { safeActionWithWorkspace } from '../state/storage';
import useFullscreenButton from './useFullscreenButton';
import { useWorkspaceMainJS, useGMSpaceFolders } from './useWorkspaceFile';

/**
 * Central hook used in `CodeEditorPage`.
 *
 * @returns
 */
export const useWorkspaceGames = () => {
  const { ipcRenderer } = window.electron;
  const [selectedGame, setselectedGame] = useState(''); // select game to preview game
  const [gameLocalURL, setGameLocalURL] = useState(homepage);

  const { gameFolders, refreshGamesInSpace } = useGMSpaceFolders();
  const { mainJSCode } = useWorkspaceMainJS(selectedGame);
  const { isWVFullscreen, fullScreenOpenHandler, closeFullscreenGameHandler } =
    useFullscreenButton(gameLocalURL);

  const gameSelectedHandler = (game: string) => {
    setselectedGame(game);
  };

  const openWorkspaceFolder = () => {
    // Call main process
    safeActionWithWorkspace((workspace) => {
      ipcRenderer.sendMessage(IpcEvents.OPEN_GMSPACE_DIRS, [workspace]);
    });
  };

  useEffect(() => {
    // just for demo downloaded while wor
    if (gameFolders.length === 1) {
      setselectedGame('demo');
    }
  }, [gameFolders]);

  useEffect(() => {
    if (!selectedGame) return;
    const url = `${homepage}/${selectedGame}`;
    setGameLocalURL(url);
  }, [selectedGame]);

  return {
    games: gameFolders,
    mainJSCode,
    selectedGame,
    gameLocalURL,
    isWVFullscreen,
    fullScreenOpenHandler,
    closeFullscreenGameHandler,
    gameSelectedHandler,
    openWorkspaceFolder,
    refreshGamesInSpace,
  };
};
