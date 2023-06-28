import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES } from '../config';
import useLeftSideBar from '../hooks/useLeftSideBar';

/**
 * Coding Challenges
 *
 * @returns
 */
const ProjectsPage = () => {
  const { onModuleChanged } = useLeftSideBar();

  return (
    <div className="w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.PROJECTS}
          onModuleChanged={onModuleChanged}
        />
        <div className="file-explorer bg-gray-300 w-60 p-2">
          <h1 className=" text-lg">Challenge explorer</h1>
          <p className="p-2 text-blue-600 text-base">
            list of classic games(chapters) ...
          </p>
          <p className="p-2 text-orange-600 text-base">
            first, complete game with source code, then propose new features as
            challenges for game beginner developers...
          </p>
        </div>
      </div>
      <div className="flex-1 bg-white">
        <h1 className=" text-center p-8">Welcome to challenges page!</h1>
      </div>
    </div>
  );
};

export default ProjectsPage;
