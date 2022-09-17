import { useState, useEffect } from 'react';
import { gamePreviewDefaultURL as homepage } from '../config';
import { safeActionWithWorkspace } from '../state/storage';
import { IpcEvents } from '../../ipc-events';

export const useWorkspaceGames = (games: string[]) => {
  const { ipcRenderer } = window.electron;
  const [selectedGame, setselectedGame] = useState('');
  const [gameLocalURL, setGameLocalURL] = useState(homepage);

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
    // TODO: get games description & icon

    // demo downloaded
    if (games.length === 1) {
      setselectedGame('demo');
    }
  }, [games]);

  useEffect(() => {
    if (!selectedGame) return;
    const refreser = Math.random();
    const url = `${homepage}/${selectedGame}?r=${refreser}`;
    setGameLocalURL(url);
  }, [selectedGame]);

  return {
    games,
    selectedGame,
    gameLocalURL,
    gameSelectedHandler,
    openWorkspaceFolder,
  };
};
