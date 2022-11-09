import clsx from 'clsx';
import { Icon, IconName } from '@blueprintjs/core';

type ToolButtonProps = {
  icon: IconName;
  mini?: boolean;
  iconSize?: number;
  color?: string;
  title?: string;
  selected?: boolean;
  onClick: () => void;
};

type MiniButtonProps = {
  icon: IconName;
  size?: number;
  onClick: () => void;
};

export const MiniIconButton = ({
  icon,
  onClick,
  size = 20,
}: MiniButtonProps) => (
  <button
    type="button"
    className="block w-4 h-4 text-gray-600 hover:text-sky-600 focus:outline-none"
    onClick={onClick}
  >
    <Icon icon={icon} size={size} />
  </button>
);

export const IconToolButton = ({
  icon,
  onClick,
  mini = false,
  iconSize = 24,
  color = 'white',
  title = 'icon tool',
  selected = false,
}: ToolButtonProps) => (
  <div className="btn-box mb-1">
    <button
      type="button"
      title={title}
      className={clsx(
        'focus:outline-none hover:bg-green-500',
        mini ? 'w-6 h-6 rounded-xl hover:bg-slate-800' : 'px-3 py-2',
        selected ? 'bg-black' : ''
      )}
      onClick={onClick}
    >
      <Icon icon={icon} size={iconSize} color={color} />
    </button>
  </div>
);

type ModuleButtonProps = {
  icon: IconName;
  module: string;
  currentModule: string;
  disabled?: boolean;
  onModuleChanged: (module: string) => void;
};

export const ModuleToolButton = ({
  icon,
  module,
  currentModule,
  disabled = false,
  onModuleChanged,
}: ModuleButtonProps) => {
  const active = currentModule === module;

  return (
    <div
      className={clsx('btn-box py-3 pl-3 pr-4', {
        'border-l-2 mr-0.5': currentModule === module,
      })}
    >
      <button
        type="button"
        className={clsx(
          'icon-button focus:outline-none',
          active ? 'active' : ''
        )}
        disabled={disabled}
        onClick={() => onModuleChanged(module)}
      >
        <Icon icon={icon} size={24} color="currentColor" />
      </button>
    </div>
  );
};
