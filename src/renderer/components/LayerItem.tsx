import clsx from 'clsx';
import { useState, useRef, KeyboardEvent } from 'react';
import { ToggleIconButton } from './Buttons';
import { MapLayer } from '../hooks/useMapLayers';

type LayerProps = {
  layer: MapLayer;
  selectHandler: (id: string) => void;
  inputChangeHandler: (id: string, value: string) => void;
};

export const LayerItem = ({
  layer,
  selectHandler,
  inputChangeHandler,
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
    }
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
          onToggle={() => setUnlocked(!unlocked)}
        />
        <span className="layer-tool-separator" />
        <ToggleIconButton
          defaultIcon="eye-open"
          inverseIcon="eye-off"
          color="text-white"
          isOpen={visible}
          onToggle={() => setVisible(!visible)}
        />
      </div>
    </li>
  );
};
