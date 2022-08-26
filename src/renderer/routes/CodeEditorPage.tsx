// import { Button } from '@blueprintjs/core';
import { useNavigate } from 'react-router-dom';
import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES, MODULEROUTES } from '../config';
import { PreviewPanelHandleBar } from '../components/PreviewPanelHandleBar';

const CodeEditorPage = () => {
  const navigate = useNavigate();
  const onModuleChanged = (module: string) => {
    // console.log(module);
    navigate(MODULEROUTES[module]);
  };

  return (
    <div className="w-full h-screen flex ">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.CODE}
          onModuleChanged={onModuleChanged}
        />
        <div className="file-explorer bg-gray-300 w-60 p-2">file explorer</div>
      </div>
      <div className="main-part flex-1 text-black flex flex-col">
        <div className="tabs-bar h-8 bg-gray-200 p-1">tabs bar</div>
        <div className="code-editors bg-white flex-1 p-2">code editors</div>
        <div className="preview-output-panels bg-gray-200 h-60 ">
          <PreviewPanelHandleBar targeSelector=".preview-output-panels" />
          <span className="select-none text-xs">Game Preview Area</span>
        </div>
      </div>
      <div className="right-toolbar w-14 bg-gray-700 text-white p-2">tools</div>
    </div>
  );
};

export default CodeEditorPage;
