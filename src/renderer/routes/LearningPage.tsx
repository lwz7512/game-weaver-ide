import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES } from '../config';
import useLeftSideBar from '../hooks/useLeftSideBar';

const LearningPage = () => {
  const { onModuleChanged } = useLeftSideBar();

  return (
    <div className="w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.LEARN}
          onModuleChanged={onModuleChanged}
        />
        <div className="file-explorer bg-gray-300 w-60 p-2">
          Tutorial Categories
        </div>
      </div>
      <div className="flex-1 bg-white">
        <h1 className=" text-center p-8">Welcome to learning page!</h1>
      </div>
    </div>
  );
};

export default LearningPage;
