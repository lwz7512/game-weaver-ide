import { useState } from 'react';
import { MODULETYPES } from '../config';
import { ModuleToolButton } from './Buttons';

type SidebarProps = {
  activeModule: string;
  onModuleChanged: (module: string) => void;
};

const LeftSideBar = ({ activeModule, onModuleChanged }: SidebarProps) => {
  const [currentModule, setCurrentModule] = useState(activeModule);

  const changeModuleType = (type: string) => {
    if (currentModule === type) return;

    setCurrentModule(type);
    if (onModuleChanged) onModuleChanged(type);
  };

  return (
    <div className="sidebar w-14 bg-gray-700 text-white flex flex-col items-center">
      {/* === HOME MODULE === */}
      <ModuleToolButton
        icon="home"
        module={MODULETYPES.WELCOME}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* === CODE MODULE === */}
      <ModuleToolButton
        icon="code"
        module={MODULETYPES.CODE}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* === CODE BLOCK === */}
      <ModuleToolButton
        icon="code-block"
        module={MODULETYPES.BLOCKS}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* === TILED MODULE === */}
      <ModuleToolButton
        icon="style"
        module={MODULETYPES.TILED}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* === LEARNING MODULE === */}
      <ModuleToolButton
        icon="learning"
        module={MODULETYPES.LEARN}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* === PROJECTS MODULE === */}
      <ModuleToolButton
        icon="projects"
        module={MODULETYPES.PROJECTS}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* SPACER */}
      <div className="spacer-vertical flex-1" />
      {/* === USER MODULE === */}
      <ModuleToolButton
        icon="user"
        module={MODULETYPES.USER}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* === SETTINGS MODULE === */}
      <ModuleToolButton
        icon="cog"
        module={MODULETYPES.SETTING}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
    </div>
  );
};

export default LeftSideBar;
