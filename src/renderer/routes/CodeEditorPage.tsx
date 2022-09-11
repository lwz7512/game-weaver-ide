import { Tab, Tabs, Icon, IconName } from '@blueprintjs/core';
import { IpcEvents } from '../../ipc-events';
import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES } from '../config';
import { PreviewPanelHandleBar } from '../components/PreviewPanelHandleBar';
import useLeftSideBar from '../hooks/useLeftSideBar';
import useMonocaEditor from '../hooks/useMonocaEditor';
import useTabsBar from '../hooks/useTabsBar';

/**
 * code editor page
 * @returns code page
 */
const CodeEditorPage = () => {
  const { ipcRenderer } = window.electron;
  const { onModuleChanged } = useLeftSideBar();
  const { navbarTabId, handleNavbarTabChange } = useTabsBar();

  // TODO: save the code...
  const codeValueChangeHandler = (value: string, eol: string) => {
    // console.log('saving...');
    // console.log(value);
  };
  useMonocaEditor('#code-editors', navbarTabId, codeValueChangeHandler);

  const fullScreenOpenHandler = () => {
    const domRect = document.body.getBoundingClientRect();
    ipcRenderer.sendMessage(IpcEvents.OPEN_GAME_VIEW, [
      'https://www.github.com/',
      { width: domRect.width - 56, height: domRect.height },
    ]);
  };

  const closeFullscreenGameHandler = () => {
    ipcRenderer.sendMessage(IpcEvents.CLOSE_GAME_VIEW, []);
  };

  return (
    <div className="editor-page w-full h-screen flex ">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.CODE}
          onModuleChanged={onModuleChanged}
        />
        <div className="file-explorer bg-gray-300 w-60 p-2">
          <p>file explorer</p>
          <h1>to load game files under gmspace</h1>
        </div>
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
            src="https://www.github.com/"
            className="inline-flex w-full h-full"
          />
        </div>
      </div>
      {/* side buttons bar */}
      <div className="right-toolbar w-14 bg-gray-700 text-white px-2">
        {/* delet or close view */}
        <div className="btn-box py-3 px-2">
          <button
            type="button"
            className="focus:outline-none"
            onClick={closeFullscreenGameHandler}
          >
            <Icon icon="delete" size={24} color="white" />
          </button>
        </div>
        {/* ... */}
      </div>
    </div>
  );
};

export default CodeEditorPage;
