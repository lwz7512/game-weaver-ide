import { useState } from 'react';
import { ROUTES } from '../config';
import { ModuleToolButton } from './Buttons';
import { useLocalStorage } from '../hooks/useLocalStorage';

type SidebarProps = {
  activeModule: string;
  workspace?: string;
  onModuleChanged: (modulePath: string) => void;
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
        module={ROUTES.WELCOME}
        currentModule={currentModule}
        title="Welcome"
        onModuleChanged={changeModuleType}
      />
      {/* === CODE MODULE === */}
      <ModuleToolButton
        icon="code"
        disabled={codeMenuDisabled}
        module={ROUTES.CODE}
        currentModule={currentModule}
        title="Game Coding Environment"
        onModuleChanged={changeModuleType}
      />
      {/* === TILED MODULE === */}
      <ModuleToolButton
        icon="style"
        module={ROUTES.TILED}
        currentModule={currentModule}
        title="Game Map Editor"
        onModuleChanged={changeModuleType}
      />
      {/* === LEARNING MODULE === */}
      <ModuleToolButton
        icon="learning"
        module={ROUTES.LEARN}
        currentModule={currentModule}
        title="Tutorial and Docs"
        onModuleChanged={changeModuleType}
      />
      {/* === CHALLENGES MODULE === */}
      <ModuleToolButton
        icon="badge"
        module={ROUTES.PROJECTS}
        currentModule={currentModule}
        title="Coding Challenges"
        onModuleChanged={changeModuleType}
      />
      <ModuleToolButton
        icon="playbook"
        module={ROUTES.GAMES}
        currentModule={currentModule}
        title="Open source Javascrit games"
        onModuleChanged={changeModuleType}
      />
      {/* === CODE BLOCK === */}
      <ModuleToolButton
        icon="code-block"
        module={ROUTES.BLOCKS}
        currentModule={currentModule}
        title="Phaser Game Examples"
        onModuleChanged={changeModuleType}
      />
      {/* ================ SPACER ============== */}
      <div className="spacer-vertical flex-1" />
      {/* === USER MODULE === */}
      <ModuleToolButton
        icon="user"
        module={ROUTES.USER}
        currentModule={currentModule}
        title="User Profile"
        onModuleChanged={changeModuleType}
      />
      {/* === SETTINGS MODULE === */}
      <ModuleToolButton
        icon="cog"
        module={ROUTES.SETTING}
        currentModule={currentModule}
        title="Settings"
        onModuleChanged={changeModuleType}
      />
    </div>
  );
};

export default LeftSideBar;
