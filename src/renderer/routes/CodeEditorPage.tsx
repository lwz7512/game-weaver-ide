import { Tab, Tabs } from '@blueprintjs/core';
import appCfg from '../assets/app.json';
import { MODULETYPES } from '../config';
import LeftSideBar from '../components/LeftSideBar';
import { IconToolButton } from '../components/Buttons';
import { WorkspaceGames } from '../components/WorkspaceGames';
import { PreviewPanelHandleBar } from '../components/PreviewPanelHandleBar';
import useLeftSideBar from '../hooks/useLeftSideBar';
import useMonocaEditor from '../hooks/useMonocaEditor';
import useTabsBar from '../hooks/useTabsBar';
import useFullscreenButton from '../hooks/useFullscreenButton';
import {
  useWorkspaceMainJS,
  useGMSpaceFolders,
} from '../hooks/useWorkspaceFile';
import { useWorkspaceGames } from '../hooks/useWorkspaceGames';

/**
 * code editor page
 * @returns code page
 */
const CodeEditorPage = () => {
  const { onModuleChanged } = useLeftSideBar();
  const { navbarTabId, handleNavbarTabChange } = useTabsBar();
  // read folders under selected gmspace folder
  const { gameFolders } = useGMSpaceFolders(appCfg);
  const {
    games,
    selectedGame,
    gameLocalURL,
    gameSelectedHandler,
    openWorkspaceFolder,
  } = useWorkspaceGames(gameFolders);
  // display main.js in editor
  const { mainJSCode } = useWorkspaceMainJS(games[0]);
  // TODO: the code changed, but would be better to save manaully and refresh!
  const codeValueChangeHandler = (value: string, eol: string) => {
    // console.log('saving...');
    // console.log(value);
  };
  useMonocaEditor(
    '#code-editors',
    navbarTabId,
    mainJSCode,
    codeValueChangeHandler
  );

  const { isWVFullscreen, fullScreenOpenHandler, closeFullscreenGameHandler } =
    useFullscreenButton(gameLocalURL);

  return (
    <div className="editor-page w-full h-screen flex ">
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
        <div className="preview-output-panels bg-gray-200 h-60 ">
          <PreviewPanelHandleBar
            targeSelector=".preview-output-panels"
            onFullScreen={fullScreenOpenHandler}
          />
          <webview
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
    </div>
  );
};

export default CodeEditorPage;
