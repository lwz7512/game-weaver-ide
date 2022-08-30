/**
 * Created @2022/08/19
 */
// import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { MODULETYPES, MODULEROUTES } from '../config';
import LeftSideBar from '../components/LeftSideBar';
import { HeroBanner } from '../components/HeroBanner';
import placeHolderImg from '../assets/global-preloader.jpg';

import appCfg from '../assets/app.json';

const WelcomePage = () => {
  const navigate = useNavigate();
  const onModuleChanged = (module: string) => {
    // console.log(module);
    navigate(MODULEROUTES[module]);
  };

  // console.log(appCfg);

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
