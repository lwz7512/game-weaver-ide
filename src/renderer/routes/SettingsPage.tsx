import { useEffect, useRef } from 'react';

import { Button } from '@blueprintjs/core';
import { ToastContainer, toast } from 'react-toastify';

import { IpcEvents } from '../../ipc-events';
import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES } from '../config';
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
      'gmspace'
    )) as string[];
    // console.log(paths);
    if (paths.length === 0) return;
    initGMSpacePath(paths[0]); // save it to app
  };

  useEffect(() => {
    clearTimeout(checkerRef.current);
    // lazy detect spacePath blank ...
    checkerRef.current = setTimeout(() => {
      if (!spacePath)
        toast.warn(
          'Workspace Path not assigned, please pick one folder to start your game coding!'
        );
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
        <div className="panel">
          <h2 className="my-2 text-base text-slate-500 pl-4 border-l-4 border-green-600">
            Workspace Path: {spacePath}
          </h2>
          <Button
            icon="folder-new"
            intent="primary"
            text={`${spacePath ? 'Reset' : 'Assign'} Workspace Directory`}
            className="focus:outline-none my-4"
            onClick={openNativeDialog}
          />
        </div>
      </div>
      {/* toast container ... */}
      <ToastContainer theme="dark" autoClose={6000} />
    </div>
  );
};

export default SettingsPage;
