import { TiledPanelResizeBar } from 'renderer/components/PreviewPanelHandleBar';
import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES } from '../config';
import useLeftSideBar from '../hooks/useLeftSideBar';

const TiledEditorPage = () => {
  const { onModuleChanged } = useLeftSideBar();

  return (
    <div className="w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.TILED}
          onModuleChanged={onModuleChanged}
        />
        {/* <div className="file-explorer bg-gray-300 w-60 p-2">file explorer</div> */}
      </div>
      <div className="flex-1 bg-white">
        <h1 className=" text-center p-8">Welcome to tiled editor!</h1>
      </div>
      <div className="object-explorer bg-gray-200 w-60 flex">
        <TiledPanelResizeBar targeSelector=".object-explorer" />
        <span className="select-none">layer explorer</span>
      </div>
    </div>
  );
};

export default TiledEditorPage;
