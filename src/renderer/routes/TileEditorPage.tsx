// import * as React from 'react';
// import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES, MODULEROUTES } from '../config';

const TiledEditorPage = () => {
  const navigate = useNavigate();
  const onModuleChanged = (module: string) => {
    // console.log(module);
    navigate(MODULEROUTES[module]);
  };

  return (
    <div className="w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.TILED}
          onModuleChanged={onModuleChanged}
        />
        {/* <div className="file-explorer bg-gray-300 w-60 p-2">file explorer</div> */}
      </div>
      <div className="flex-1">
        <h1 className=" text-center p-8">Welcome to tiled editor!</h1>
      </div>
    </div>
  );
};

export default TiledEditorPage;
