/**
 * Created @2022/08/19
 */
import { MODULETYPES } from '../config';
import LeftSideBar from '../components/LeftSideBar';
import { HeroBanner } from '../components/HeroBanner';
import useLeftSideBar from '../hooks/useLeftSideBar';
import placeHolderImg from '../assets/global-preloader.jpg';

import appCfg from '../assets/app.json';

const WelcomePage = () => {
  const { onModuleChanged } = useLeftSideBar();

  return (
    <div className="welcome-page w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.WELCOME}
          onModuleChanged={onModuleChanged}
        />
      </div>
      <div className="flex-1">
        <HeroBanner
          title={appCfg.heroTitle}
          heroURL={appCfg.baseURL + appCfg.heroImage}
          placeHolder={placeHolderImg}
        />
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
