import clsx from 'clsx';
import { Icon, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

type WSGamesProps = {
  selectedGame: string;
  folders: string[]; // TODO: change to game meta objects ...
  onFolderOpened: (folder: string) => void;
  openWorkspaceFolder: () => void;
  openNewGameDialog: () => void;
  openDeleteGameConfirmation: (folder: string) => void;
};

export const WorkspaceGames = ({
  selectedGame,
  folders,
  onFolderOpened,
  openWorkspaceFolder,
  openNewGameDialog,
  openDeleteGameConfirmation,
}: WSGamesProps) => {
  const exampleMenu = (
    <Menu>
      <MenuItem icon="folder-new" text="New Game" onClick={openNewGameDialog} />
      <MenuDivider />
      <MenuItem
        icon="locate"
        text="Show Workspace"
        onClick={openWorkspaceFolder}
      />
    </Menu>
  );

  return (
    <div className="file-explorer bg-gray-200 w-60">
      <h1 className="p-4 bg-gray-800 text-slate-400 text-sm text-center select-none">
        <span className="inline-block pr-8 pl-2">Code Editor Page</span>
        <Popover2
          content={exampleMenu}
          placement="left-start"
          autoFocus={false}
          modifiers={{ arrow: { enabled: true } }}
        >
          <button
            type="button"
            className="focus:outline-none"
            onClick={() => null}
          >
            <Icon icon="menu" size={18} color="white" />
          </button>
        </Popover2>
      </h1>
      <ul className="text-base">
        {folders.map((game) => (
          <li
            key={game}
            className={clsx('game-folder mb-px bg-slate-600 hover:bg-sky-600', {
              selected: selectedGame === game,
            })}
          >
            <button
              type="button"
              className="game-item inline-block w-48"
              onClick={() => onFolderOpened(game)}
            >
              <Icon
                icon={selectedGame === game ? 'folder-open' : 'folder-close'}
                size={18}
                color="white"
              />
              <span className=" w-32 ml-4 inline-block">{game}</span>
            </button>
            {/* more action button, show up on hover */}
            <button
              type="button"
              className="more-btn inline-block focus:outline-none p-2 ml-2 w-8 h-9"
              onClick={() => openDeleteGameConfirmation(game)}
            >
              <Icon icon="trash" size={18} color="white" className="hidden" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
