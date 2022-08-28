// import * as React from 'react';
// import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { Button } from '@blueprintjs/core';

import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES, MODULEROUTES } from '../config';

const SettingsPage = () => {
  const { ipcRenderer } = window.electron;

  const navigate = useNavigate();
  const onModuleChanged = (module: string) => {
    // console.log(module);
    navigate(MODULEROUTES[module]);
  };

  const openNativeDialog = async () => {
    // ipcRenderer.sendMessage('showDialog', ['hello!']);
    const paths = await ipcRenderer.invoke('showDialog', 'hi there!');
    // TODO: console.log(paths);
    // displace path on page...and allow user to change.
  };

  return (
    <div className="w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.SETTING}
          onModuleChanged={onModuleChanged}
        />
        {/* <div className="file-explorer bg-gray-300 w-60 p-2">file explorer</div> */}
      </div>
      <div className="flex-1 p-4">
        <h1 className="text-lg text-center p-8">Welcome to setting page!</h1>
        <Button
          icon="folder-new"
          intent="primary"
          text="Select Workspace Directory"
          onClick={openNativeDialog}
        />
      </div>
    </div>
  );
};

export default SettingsPage;
