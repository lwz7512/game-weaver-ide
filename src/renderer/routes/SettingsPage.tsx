// import * as React from 'react';
import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { Button } from '@blueprintjs/core';

import { IpcEvents } from '../../ipc-events';
import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES, MODULEROUTES } from '../config';
import { saveWorkspacePath, checkWorkspacePath } from '../state/storage';

const SettingsPage = () => {
  const { ipcRenderer } = window.electron;
  const [spacePath, setSpacePath] = useState('');

  const navigate = useNavigate();
  const onModuleChanged = (module: string) => {
    // console.log(module);
    navigate(MODULEROUTES[module]);
  };

  const openNativeDialog = async () => {
    const paths = (await ipcRenderer.invoke(
      IpcEvents.OPEN_SETTINGS,
      'gmspace'
    )) as string[];
    // display and allow user to change.
    setSpacePath(paths[0]);
    saveWorkspacePath(paths[0]);
  };

  useEffect(() => {
    const workspace = checkWorkspacePath();
    if (workspace) setSpacePath(workspace);
  }, []);

  return (
    <div className="w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.SETTING}
          onModuleChanged={onModuleChanged}
        />
        <div className="file-explorer bg-gray-300 w-60 p-2">
          Setting explorer
        </div>
      </div>
      <div className="flex-1 py-2 px-4 bg-white">
        <h1 className="text-lg text-center p-8 border-b-2">
          Welcome to setting page!
        </h1>
        <h2 className="my-4 text-base text-slate-500 pl-4 border-l-4 border-green-600">
          Workspace Path: {spacePath}
        </h2>
        <Button
          icon="folder-new"
          intent="primary"
          text={`${spacePath ? 'Reset' : 'Create'} Workspace Directory`}
          className="focus:outline-none"
          onClick={openNativeDialog}
        />
      </div>
    </div>
  );
};

export default SettingsPage;
