/**
 * Open source javascript games
 * @date 2024/04/27
 */

import {
  ROUTES,
} from '../config';
import LeftSideBar from '../components/LeftSideBar';
import useLeftSideBar from '../hooks/useLeftSideBar';

const OSGamePage = () => {
  const { onModuleChanged } = useLeftSideBar();

  return (
    <div className="games-page w-full h-screen flex">
      {/* left part */}
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={ROUTES.GAMES}
          onModuleChanged={onModuleChanged}
        />
      </div>
      {/* right part */}
      <div className="flex-1 py-2 px-4 bg-white">
        <h1 className="text-lg text-center p-8 border-b-2 mb-8 font-semibold text-slate-600">
          Welcome to Open source Javascript Games Center!
        </h1>
        <p>comming soon...</p>
      </div>
    </div>
  );
};

export default OSGamePage;
