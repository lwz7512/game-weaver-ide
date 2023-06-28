import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES } from '../config';
import useLeftSideBar from '../hooks/useLeftSideBar';

/**
 * Tutorial and Docs
 *
 * @returns
 */
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
          <h1 className=" text-lg">Tutorial Categories</h1>
          <p className="p-2 text-blue-600 text-base">
            List of programming links ...
          </p>
          <p className="p-2 text-orange-600 text-base">
            Including 3 levels tutorials:
          </p>
          <ul className="p-2 text-sm list-item text-cyan-700 leading-6">
            <li>Beginners: Javascript basics</li>
            <li>Medium(junior) devs: Game development foundmentals</li>
            <li>Professional devs: OOP & design patterns</li>
          </ul>
        </div>
      </div>
      <div className="flex-1 bg-white">
        <h1 className=" text-center p-8">Welcome to learning page!</h1>
      </div>
    </div>
  );
};

export default LearningPage;
