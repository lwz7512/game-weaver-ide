import clsx from 'clsx';
import { Icon, IconName } from '@blueprintjs/core';

type ToolButtonProps = {
  icon: IconName;
  mini?: boolean;
  iconSize?: number;
  onClick: () => void;
};

export const IconToolButton = ({
  icon,
  onClick,
  mini = false,
  iconSize = 24,
}: ToolButtonProps) => (
  <div className="btn-box mb-1">
    <button
      type="button"
      className={clsx(
        'focus:outline-none hover:bg-green-500',
        mini ? 'w-6 h-6 rounded-xl hover:bg-slate-800' : 'px-3 py-2'
      )}
      onClick={onClick}
    >
      <Icon icon={icon} size={iconSize} color="white" />
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
