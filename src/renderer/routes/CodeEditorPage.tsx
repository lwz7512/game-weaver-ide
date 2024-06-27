import { Tab, Tabs } from '@blueprintjs/core';
import { Layout } from './Layout';
import { ROUTES } from '../config';
import { IconToolButton } from '../components/Buttons';
import { WorkspaceGames } from '../components/WorkspaceGames';
import { NewGameDialog } from '../components/NewGameDialog';
import { DeleteGameAlert } from '../components/DeleteGameAlert';
import { PreviewPanelHandleBar } from '../components/PreviewPanelHandleBar';
import { useCodeEditorPage } from '../controllers/useCodeEditorPage';

/**
 * code editor page
 * @returns code page
 */
const CodeEditorPage = () => {
  const {
    deletedGame,
    games,
    gameLocalURL,
    isWVFullscreen,
    navbarTabId,
    selectedGame,
    isNewOpen,
    isDeleteOpen,
    isLoading,
    gameSelectedHandler,
    openWorkspaceFolder,
    handleOpen,
    openDeleteGameDialog,
    handleNavbarTabChange,
    openGameInFullScreen,
    closeFullscreenGameHandler,
    refreshPreview,
    saveMainJS,
    toggleDevTools,
    handleClose,
    savePathCheckHandler,
    createGameProjectHandler,
    refreshGamesInSpace,
    handleDeleteClose,
    handleDeleteConfirm,
  } = useCodeEditorPage();

  return (
    <Layout
      pageName="editor"
      modulePath={ROUTES.CODE}
      sidePanel={
        <WorkspaceGames
          folders={games}
          selectedGame={selectedGame}
          onFolderOpened={gameSelectedHandler}
          openWorkspaceFolder={openWorkspaceFolder}
          openNewGameDialog={handleOpen}
          openDeleteGameConfirmation={openDeleteGameDialog}
        />
      }
    >
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
        {/* === Monaco Code Editor Container === */}
        <div className="bg-white flex-1 p-1">
          <div id="code-editors" className="code-editors bg-slate-100" />
        </div>
        <div className="preview-output-panels bg-black h-60 ">
          <PreviewPanelHandleBar
            targeSelector=".preview-output-panels"
            onFullScreen={openGameInFullScreen}
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
      <div className="right-toolbar w-14 bg-gray-700 text-white p-1">
        {/* delet or close view */}
        {isWVFullscreen && (
          <IconToolButton icon="delete" onClick={closeFullscreenGameHandler} />
        )}
        <IconToolButton icon="play" title="Run Game" onClick={refreshPreview} />
        <IconToolButton icon="floppy-disk" title="Save" onClick={saveMainJS} />
        <IconToolButton
          icon="console"
          title="Open Console"
          onClick={toggleDevTools}
        />
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
    </Layout>
  );
};

export default CodeEditorPage;
