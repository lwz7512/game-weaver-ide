import clsx from 'clsx';
import { useState, useRef, KeyboardEvent } from 'react';
import { ToggleIconButton } from './Buttons';
import { MapLayer } from '../hooks/useMapLayers';

type LayerProps = {
  layer: MapLayer;
  selectHandler: (id: number) => void;
  inputChangeHandler: (id: number, value: string) => void;
  availableToggleHandler: (id: number, value: boolean) => void;
  visibleToggleHandler: (id: number, value: boolean) => void;
};

export const LayerItem = ({
  layer,
  selectHandler,
  inputChangeHandler,
  availableToggleHandler,
  visibleToggleHandler,
}: LayerProps) => {
  const [unlocked, setUnlocked] = useState(true);
  const [visible, setVisible] = useState(true);
  const [editable, setEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const editModeHandler = () => {
    setEditable(true);
    setTimeout(() => {
      inputRef.current?.setSelectionRange(0, layer.name.length);
    });
  };

  const displayModeHandler = () => {
    setEditable(false);
  };

  const keyboardEventHandler = (event: KeyboardEvent) => {
    const key = event.code;
    if (key === 'Enter') {
      setEditable(false);
      inputRef.current?.setSelectionRange(0, 0);
    }
  };

  const lockLayerHandler = () => {
    setUnlocked(!unlocked);
    availableToggleHandler(layer.id, !unlocked);
  };

  const showLayerHandler = () => {
    setVisible(!visible);
    visibleToggleHandler(layer.id, !visible);
  };

  return (
    <li
      className={clsx(
        'layer-item',
        layer.selected ? 'bg-slate-600 text-white' : 'bg-slate-300'
      )}
    >
      <input
        value={layer.name}
        readOnly={!editable}
        ref={inputRef}
        className={clsx(
          'bg-none focus:outline-0 select-none cursor-default px-2 w-40',
          layer.selected ? 'bg-green-500 black-selection' : '',
          editable ? 'border-2 border-green-800 py-0.5' : 'py-1'
        )}
        onClick={() => selectHandler(layer.id)}
        onBlur={displayModeHandler}
        onKeyDown={keyboardEventHandler}
        onDoubleClick={editModeHandler}
        onChange={(evt) => inputChangeHandler(layer.id, evt.target.value)}
      />
      <div className={clsx('px-1 inline-block')}>
        <ToggleIconButton
          defaultIcon="lock"
          inverseIcon="unlock"
          color="text-white"
          isOpen={unlocked}
          onToggle={lockLayerHandler}
        />
        <span className="layer-tool-separator" />
        <ToggleIconButton
          defaultIcon="eye-open"
          inverseIcon="eye-off"
          color="text-white"
          isOpen={visible}
          onToggle={showLayerHandler}
        />
      </div>
    </li>
  );
};
