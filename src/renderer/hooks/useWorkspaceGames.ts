import { useState, useEffect } from 'react';
import { IpcEvents } from '../../ipc-events';
import { gamePreviewDefaultURL as homepage } from '../config';
import { safeActionWithWorkspace } from '../state/storage';
import { useWorkspaceMainJS, useGMSpaceFolders } from './useWorkspaceFile';
import { getLastOpenGame, saveLastOpenGame } from '../state/session';

/**
 * Central hook used in `CodeEditorPage`.
 *
 * using two hooks:
 * - useGMSpaceFolders
 * - useWorkspaceMainJS
 *
 * @returns
 */
export const useWorkspaceGames = () => {
  const { ipcRenderer } = window.electron;
  const lastOpenGame = getLastOpenGame();
  const [selectedGame, setselectedGame] = useState(lastOpenGame); // select game to preview game
  const [gameLocalURL, setGameLocalURL] = useState(homepage);

  const { gameFolders, refreshGamesInSpace } = useGMSpaceFolders();
  const { mainJSCode } = useWorkspaceMainJS(selectedGame);

  const gameSelectedHandler = (game: string) => {
    setselectedGame(game);
    saveLastOpenGame(game);
  };

  const openWorkspaceFolder = () => {
    // Call main process
    safeActionWithWorkspace((workspace) => {
      ipcRenderer.sendMessage(IpcEvents.OPEN_GMSPACE_DIRS, [workspace]);
    });
  };

  /**
   * reset to no game selected!
   */
  const restoreToNoGame = () => {
    setselectedGame('');
    refreshGamesInSpace();
  };

  useEffect(() => {
    if (!selectedGame) return setGameLocalURL(homepage);

    const url = `${homepage}/${selectedGame}`;
    setGameLocalURL(url);
  }, [selectedGame]);

  return {
    games: gameFolders,
    mainJSCode,
    selectedGame,
    gameLocalURL,
    gameSelectedHandler,
    openWorkspaceFolder,
    refreshGamesInSpace,
    restoreToNoGame,
  };
};
