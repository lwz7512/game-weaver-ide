// import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@blueprintjs/core';
import { IpcEvents } from '../../ipc-events';
import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES,  } from '../config';
import { saveWorkspacePath, checkWorkspacePath } from '../state/storage';
import useLeftSideBar from '../hooks/useLeftSideBar';

const SettingsPage = () => {
  const { ipcRenderer } = window.electron;
  const [spacePath, setSpacePath] = useState('');

  const { onModuleChanged } = useLeftSideBar();

  const openNativeDialog = async () => {
    const paths = (await ipcRenderer.invoke(
      IpcEvents.OPEN_SETTINGS,
      'gmspace'
    )) as string[];
    // console.log(paths);
    if (paths.length === 0) return;
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
        <h1 className="text-lg text-center p-8 border-b-2 mb-8 font-semibold text-slate-600">
          Welcome to setting page!
        </h1>
        <div className="panel">
          <h2 className="my-2 text-base text-slate-500 pl-4 border-l-4 border-green-600">
            Workspace Path: {spacePath}
          </h2>
          <Button
            icon="folder-new"
            intent="primary"
            text={`${spacePath ? 'Reset' : 'Create'} Workspace Directory`}
            className="focus:outline-none my-4"
            onClick={openNativeDialog}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
