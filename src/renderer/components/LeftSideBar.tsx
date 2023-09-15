import { useState } from 'react';
import { MODULETYPES } from '../config';
import { ModuleToolButton } from './Buttons';
import { useLocalStorage } from '../hooks/useLocalStorage';

type SidebarProps = {
  activeModule: string;
  workspace?: string;
  onModuleChanged: (module: string) => void;
};

const LeftSideBar = ({
  activeModule,
  onModuleChanged,
  workspace = '',
}: SidebarProps) => {
  const [currentModule, setCurrentModule] = useState(activeModule);
  const { spacePath } = useLocalStorage();
  const codeMenuDisabled = workspace ? false : !spacePath;

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
        title="Welcome"
        onModuleChanged={changeModuleType}
      />
      {/* === CODE MODULE === */}
      <ModuleToolButton
        icon="code"
        disabled={codeMenuDisabled}
        module={MODULETYPES.CODE}
        currentModule={currentModule}
        title="Game Coding Environment"
        onModuleChanged={changeModuleType}
      />
      {/* === TILED MODULE === */}
      <ModuleToolButton
        icon="style"
        module={MODULETYPES.TILED}
        currentModule={currentModule}
        title="Game Map Editor"
        onModuleChanged={changeModuleType}
      />
      {/* === LEARNING MODULE === */}
      <ModuleToolButton
        icon="learning"
        module={MODULETYPES.LEARN}
        currentModule={currentModule}
        title="Tutorial and Docs"
        onModuleChanged={changeModuleType}
      />
      {/* === CHALLENGES MODULE === */}
      <ModuleToolButton
        icon="badge"
        module={MODULETYPES.PROJECTS}
        currentModule={currentModule}
        title="Coding Challenges"
        onModuleChanged={changeModuleType}
      />
      {/* === CODE BLOCK === */}
      <ModuleToolButton
        icon="code-block"
        module={MODULETYPES.BLOCKS}
        currentModule={currentModule}
        title="Phaser Game Examples"
        onModuleChanged={changeModuleType}
      />
      {/* ================ SPACER ============== */}
      <div className="spacer-vertical flex-1" />
      {/* === USER MODULE === */}
      <ModuleToolButton
        icon="user"
        module={MODULETYPES.USER}
        currentModule={currentModule}
        title="User Profile"
        onModuleChanged={changeModuleType}
      />
      {/* === SETTINGS MODULE === */}
      <ModuleToolButton
        icon="cog"
        module={MODULETYPES.SETTING}
        currentModule={currentModule}
        title="Settings"
        onModuleChanged={changeModuleType}
      />
    </div>
  );
};

export default LeftSideBar;
