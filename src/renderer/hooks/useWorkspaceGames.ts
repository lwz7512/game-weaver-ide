import { useState, useEffect } from 'react';
import { IpcEvents } from '../../ipc-events';
import { gamePreviewDefaultURL as homepage, ConfigType } from '../config';
import { safeActionWithWorkspace } from '../state/storage';
import useFullscreenButton from './useFullscreenButton';
import { useWorkspaceMainJS, useGMSpaceFolders } from './useWorkspaceFile';

/**
 * Central hook used in `CodeEditorPage`.
 *
 * @param appCfg global config in app.json
 * @returns
 */
export const useWorkspaceGames = (appCfg: ConfigType) => {
  const { ipcRenderer } = window.electron;
  const [selectedGame, setselectedGame] = useState('');
  const [gameLocalURL, setGameLocalURL] = useState(homepage);

  const { gameFolders } = useGMSpaceFolders(appCfg);
  const { mainJSCode } = useWorkspaceMainJS(gameFolders[0]);
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
    // TODO: get games description & icon

    // demo downloaded
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
  };
};
