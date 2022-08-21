import clsx from 'clsx';
import { useState } from 'react';
import { Icon, IconName } from '@blueprintjs/core';
import { MODULETYPES } from 'renderer/config';

type SidebarProps = {
  activeModule: string;
  onModuleChanged: (module: string) => void;
};

type IconButtonProps = {
  icon: IconName;
  module: string;
  currentModule: string;
  onModuleChanged: (module: string) => void;
};

const IconToolButton = ({
  icon,
  module,
  currentModule,
  onModuleChanged,
}: IconButtonProps) => (
  <div
    className={clsx('btn-box py-3 pl-3 pr-4', {
      'border-l-2': currentModule === module,
    })}
  >
    <button
      type="button"
      className="focus:outline-none "
      onClick={() => onModuleChanged(module)}
    >
      <Icon
        icon={icon}
        size={24}
        color={currentModule === module ? 'white' : 'lightsteelblue'}
      />
    </button>
  </div>
);

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
      <IconToolButton
        icon="home"
        module={MODULETYPES.WELCOME}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* === CODE MODULE === */}
      <IconToolButton
        icon="code"
        module={MODULETYPES.CODE}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* === CODE BLOCK === */}
      <IconToolButton
        icon="code-block"
        module={MODULETYPES.BLOCKS}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* === TILED MODULE === */}
      <IconToolButton
        icon="style"
        module={MODULETYPES.TILED}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* === LEARNING MODULE === */}
      <IconToolButton
        icon="learning"
        module={MODULETYPES.LEARN}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* === PROJECTS MODULE === */}
      <IconToolButton
        icon="projects"
        module={MODULETYPES.PROJECTS}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* SPACER */}
      <div className="spacer-vertical flex-1" />
      {/* === USER MODULE === */}
      <IconToolButton
        icon="user"
        module={MODULETYPES.USER}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
      {/* === SETTINGS MODULE === */}
      <IconToolButton
        icon="cog"
        module={MODULETYPES.SETTING}
        currentModule={currentModule}
        onModuleChanged={changeModuleType}
      />
    </div>
  );
};

export default LeftSideBar;
