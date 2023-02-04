import { useEffect, useRef } from 'react';

import { Button } from '@blueprintjs/core';
import { ToastContainer, toast } from 'react-toastify';

import { IpcEvents } from '../../ipc-events';
import LeftSideBar from '../components/LeftSideBar';
import {
  MODULETYPES,
  port,
  WORKSPACE_ASSIGNED,
  WORKSPACE_UNDEFINED,
} from '../config';
import useLeftSideBar from '../hooks/useLeftSideBar';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SettingsPage = () => {
  const { ipcRenderer } = window.electron;

  const { onModuleChanged } = useLeftSideBar();
  const { spacePath, initGMSpacePath } = useLocalStorage();
  const checkerRef = useRef<NodeJS.Timeout>();

  // set workspace by open file dialog
  const openNativeDialog = async () => {
    const paths = (await ipcRenderer.invoke(
      IpcEvents.OPEN_SETTINGS,
      'gmspace' // new folder to be created in selected path
    )) as string[];
    // console.log(paths);
    if (paths.length === 0) return;
    initGMSpacePath(paths[0]); // save it to app
    // NOTE: tring to restart server ...
    // this is absolutely necessary at first of workspace setting!
    // but if server is running, restart is needed to make it works.
    ipcRenderer.sendMessage(IpcEvents.START_HTTP_SERVER, [port, paths[0]]);
    toast.success(WORKSPACE_ASSIGNED);
  };

  useEffect(() => {
    clearTimeout(checkerRef.current);
    // lazy detect spacePath blank ...
    checkerRef.current = setTimeout(() => {
      if (!spacePath) toast.warn(WORKSPACE_UNDEFINED);
    }, 100);
  }, [spacePath]);

  return (
    <div className="w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          workspace={spacePath}
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
        {/* Section 1: game workspace path */}
        <div className="panel">
          <h1 className="text-base text-black underline">
            Game Workspace Path Setting
          </h1>
          <Button
            icon="folder-new"
            intent="primary"
            text={`${spacePath ? 'Reset' : 'Create'} Workspace Directory`}
            className="focus:outline-none my-4 py-2 px-4 text-sm"
            onClick={openNativeDialog}
          />
          <h2 className="quote-in-panel">Workspace Path: {spacePath}</h2>
        </div>
      </div>
      {/* toast container ... */}
      <ToastContainer theme="dark" autoClose={6000} />
    </div>
  );
};

export default SettingsPage;
