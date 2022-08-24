// import * as React from 'react';
// import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { MODULETYPES, MODULEROUTES } from '../config';
import LeftSideBar from '../components/LeftSideBar';

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
        <div className="hero-banner bg-slate-300 h-64">
          <h1 className="text-lg text-center p-8">Welcome to Game Weaver!</h1>
        </div>
        <div className="four-section-grid">
          <div className="section">
            <h2 className="text-base">New...</h2>
          </div>
          <div className="section">
            <h2 className="text-base">Tutorials</h2>
          </div>
          <div className="section">
            <h2 className="text-base">Recent</h2>
          </div>
          <div className="section">
            <h2 className="text-base">Projects</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
