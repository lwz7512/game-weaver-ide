import clsx from 'clsx';
import { useState } from 'react';
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
  color?: string;
  onClick: () => void;
};

export const MiniIconButton = ({
  icon,
  onClick,
  size = 20,
  color = 'text-gray-600',
}: MiniButtonProps) => (
  <button
    type="button"
    className={`inline-block w-5 h-5 hover:text-green-600 focus:outline-none ${color}`}
    onClick={onClick}
  >
    <Icon icon={icon} size={size} />
  </button>
);

type ToggleButtonProps = {
  defaultIcon: IconName;
  inverseIcon: IconName;
  size?: number;
  color?: string;
  isOpen: boolean;
  onToggle: () => void;
};

export const ToggleIconButton = ({
  defaultIcon,
  inverseIcon,
  size = 20,
  color = 'text-gray-600',
  isOpen,
  onToggle,
}: ToggleButtonProps) => {
  return (
    <button
      type="button"
      className={clsx(
        'inline-block w-5 h-5 hover:text-green-600 focus:outline-none ',
        color
      )}
      onClick={() => onToggle()}
    >
      <Icon icon={isOpen ? defaultIcon : inverseIcon} size={size} />
    </button>
  );
};

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
  title?: string;
  onModuleChanged: (module: string) => void;
};

export const ModuleToolButton = ({
  icon,
  module,
  currentModule,
  disabled = false,
  title = 'Tool',
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
        title={title}
        onClick={() => onModuleChanged(module)}
      >
        <Icon icon={icon} size={24} color="currentColor" />
      </button>
    </div>
  );
};
