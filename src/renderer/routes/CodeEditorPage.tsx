import { Tab, Tabs } from '@blueprintjs/core';

import { MODULETYPES } from '../config';
import LeftSideBar from '../components/LeftSideBar';
import { IconToolButton } from '../components/Buttons';
import { WorkspaceGames } from '../components/WorkspaceGames';
import { NewGameDialog } from '../components/NewGameDialog';
import { DeleteGameAlert } from '../components/DeleteGameAlert';
import { PreviewPanelHandleBar } from '../components/PreviewPanelHandleBar';
import useLeftSideBar from '../hooks/useLeftSideBar';
import useMonocaEditor, { useIframeContext } from '../hooks/useMonocaEditor';
import useTabsBar from '../hooks/useTabsBar';
import { useWorkspaceGames } from '../hooks/useWorkspaceGames';
import { useNewGameDialog } from '../hooks/useNewGameDialog';
import { useDeleteGameDialog } from '../hooks/useDeleteGameDialog';

/**
 * code editor page
 * @returns code page
 */
const CodeEditorPage = () => {
  const { onModuleChanged } = useLeftSideBar();
  const { navbarTabId, handleNavbarTabChange } = useTabsBar();
  // read folders under selected gmspace folder
  const {
    games,
    mainJSCode,
    selectedGame,
    gameLocalURL,
    isWVFullscreen,
    closeFullscreenGameHandler,
    fullScreenOpenHandler,
    gameSelectedHandler,
    openWorkspaceFolder,
    refreshGamesInSpace,
    restoreToNoGame,
  } = useWorkspaceGames();

  // save the latest url to refresh!
  useIframeContext(gameLocalURL);
  useMonocaEditor(navbarTabId, mainJSCode);

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

  return (
    <div className="editor-page w-full h-screen flex focus:outline-none">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.CODE}
          onModuleChanged={onModuleChanged}
        />
        <WorkspaceGames
          folders={games}
          selectedGame={selectedGame}
          onFolderOpened={gameSelectedHandler}
          openWorkspaceFolder={openWorkspaceFolder}
          openNewGameDialog={handleOpen}
          openDeleteGameConfirmation={openDeleteGameDialog}
        />
      </div>
      <div className="main-part flex-1 text-black flex flex-col">
        <div className="tabs-bar h-9 bg-gray-200 p-1">
          <Tabs
            id="navbar"
            animate
            onChange={handleNavbarTabChange}
            selectedTabId={navbarTabId}
          >
            <Tab
              id="main"
              title="Main Scene"
              className="select-none focus: outline-none"
            />
            <Tab
              id="success"
              title="Sucess Scene"
              className="select-none focus: outline-none"
            />
            <Tab
              id="failure"
              title="Failure Scene"
              className="select-none focus: outline-none"
            />
          </Tabs>
        </div>
        {/* code editor container */}
        <div className="bg-white flex-1 p-1">
          <div id="code-editors" className="code-editors bg-slate-100" />
        </div>
        <div className="preview-output-panels bg-black h-60 ">
          <PreviewPanelHandleBar
            targeSelector=".preview-output-panels"
            onFullScreen={fullScreenOpenHandler}
          />
          <iframe
            title="Game Preview"
            id="gwpreview"
            src={gameLocalURL}
            className="inline-flex w-full h-full"
          />
        </div>
      </div>
      {/* side buttons bar */}
      <div className="right-toolbar w-14 bg-gray-700 text-white px-2">
        {/* delet or close view */}
        {isWVFullscreen && (
          <IconToolButton icon="delete" onClick={closeFullscreenGameHandler} />
        )}
        {/* ... */}
      </div>
      {/* lazy initialize dialog until open */}
      {isNewOpen && (
        <NewGameDialog
          isOpen={isNewOpen}
          handleClose={handleClose}
          checkSavePathExist={savePathCheckHandler}
          createGameProject={createGameProjectHandler}
          onGameCreateSuccess={refreshGamesInSpace}
        />
      )}
      {/* delete game alert */}
      {isDeleteOpen && (
        <DeleteGameAlert
          game={deletedGame}
          isOpen={isDeleteOpen}
          isLoading={isLoading}
          handleCloseDialog={handleDeleteClose}
          handleDeleteGame={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default CodeEditorPage;
