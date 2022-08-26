/**
 * Created @2022/08/19
 */
import { useNavigate } from 'react-router-dom';
import { MODULETYPES, MODULEROUTES } from '../config';
import LeftSideBar from '../components/LeftSideBar';

import spaceGameImg from '../assets/space-game-level-banner-with-platforms-flying-spaceship_md.jpg';

const WelcomePage = () => {
  const navigate = useNavigate();
  const onModuleChanged = (module: string) => {
    // console.log(module);
    navigate(MODULEROUTES[module]);
  };

  return (
    <div className="welcome-page w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.WELCOME}
          onModuleChanged={onModuleChanged}
        />
      </div>
      <div className="flex-1">
        <div className="hero-banner relative bg-slate-300 h-64 xl:h-80">
          <img
            src={spaceGameImg}
            alt="banner"
            className="absolute top-0 left-0 w-full object-cover z-0 h-full"
          />
          <h1 className="text-2xl top-10 left-10 text-center p-8 absolute z-10 text-white">
            Welcome to Game Weaver!
          </h1>
        </div>
        <div className="four-section-grid grid grid-cols-3 grid-rows-2">
          <div className="section">
            <h2 className="text-lg font-semibold">New...</h2>
          </div>
          <div className="section">
            <h2 className="text-lg font-semibold">Recent</h2>
          </div>
          <div className="section right-cell">
            <h2 className="text-lg font-semibold">Tutorials</h2>
          </div>
          <div className="section">
            <h2 className="text-lg font-semibold">Samples</h2>
          </div>
          <div className="section">
            <h2 className="text-lg font-semibold">Projects</h2>
          </div>
          <div className="section right-cell">
            <h2 className="text-lg font-semibold">Updates</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
