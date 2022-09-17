import clsx from 'clsx';
import { Icon } from '@blueprintjs/core';

type WSGamesProps = {
  selectedGame: string;
  folders: string[];
  onFolderOpened: (folder: string) => void;
  openWorkspaceFolder: () => void;
};

export const WorkspaceGames = ({
  selectedGame,
  folders,
  onFolderOpened,
  openWorkspaceFolder,
}: WSGamesProps) => {
  return (
    <div className="file-explorer bg-gray-200 w-60">
      <h1 className="p-4 bg-gray-800 text-slate-400 text-sm text-center select-none">
        <span className="inline-block pr-8 pl-2">Games in Worksppace</span>
        <button
          type="button"
          className="focus:outline-none"
          onClick={openWorkspaceFolder}
        >
          <Icon icon="locate" size={18} color="white" />
        </button>
      </h1>
      <ul className="text-base">
        {folders.map((game) => (
          <li className="mb-px" key={game}>
            <button
              type="button"
              className={clsx('game-item', { selected: selectedGame === game })}
              onClick={() => onFolderOpened(game)}
            >
              <Icon
                icon={selectedGame === game ? 'folder-open' : 'folder-close'}
                size={18}
                color="white"
              />
              <span className="w-40 mr-4 inline-block">{game}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
