/**
 * Main logic for `CodeEditorPage`
 * @2023/05/02
 */

import useMonocaEditor from '../hooks/useMonocaEditor';
import { useIframeContext } from '../hooks/useIframeContext';
import useTabsBar from '../hooks/useTabsBar';
import { useWorkspaceGames } from '../hooks/useWorkspaceGames';
import useFullscreenButton from '../hooks/useFullscreenButton';
import { useNewGameDialog } from '../hooks/useNewGameDialog';
import { useDeleteGameDialog } from '../hooks/useDeleteGameDialog';
import useWindowEvents from '../hooks/useWindowEvents';
import { useRightSideBar } from '../hooks/useRightSideBar';

export const useCodeEditorPage = () => {
  useWindowEvents();
  const { navbarTabId, handleNavbarTabChange } = useTabsBar();
  // read folders under selected gmspace folder
  const {
    games,
    mainJSCode,
    selectedGame,
    gameLocalURL,
    gameSelectedHandler,
    openWorkspaceFolder,
    refreshGamesInSpace,
    restoreToNoGame,
  } = useWorkspaceGames();

  const { isWVFullscreen, openGameInFullScreen, closeFullscreenGameHandler } =
    useFullscreenButton(gameLocalURL);

  // init editor and return sth sidebar used
  const { currentFile, getCurrentCode } = useMonocaEditor(
    navbarTabId,
    mainJSCode
  );
  const { saveMainJS, toggleDevTools } = useRightSideBar(
    selectedGame,
    currentFile,
    getCurrentCode
  );

  // save the latest game and refresh!
  const refreshPreview = useIframeContext(gameLocalURL, saveMainJS);

  const {
    isOpen: isNewOpen,
    handleOpen,
    handleClose,
    savePathCheckHandler,
    createGameProjectHandler,
  } = useNewGameDialog();

  const {
    isOpen: isDeleteOpen,
    isLoading,
    deletedGame,
    openDeleteGameDialog,
    handleDeleteClose,
    handleDeleteConfirm,
  } = useDeleteGameDialog(restoreToNoGame);

  return {
    games,
    selectedGame,
    gameSelectedHandler,
    openWorkspaceFolder,
    handleOpen,
    openDeleteGameDialog,
    handleNavbarTabChange,
    navbarTabId,
    openGameInFullScreen,
    gameLocalURL,
    isWVFullscreen,
    closeFullscreenGameHandler,
    refreshPreview,
    saveMainJS,
    toggleDevTools,
    isNewOpen,
    handleClose,
    savePathCheckHandler,
    createGameProjectHandler,
    refreshGamesInSpace,
    isDeleteOpen,
    deletedGame,
    isLoading,
    handleDeleteClose,
    handleDeleteConfirm,
  };
};
