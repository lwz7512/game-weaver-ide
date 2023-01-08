import { ChangeEvent, useEffect, useState, useRef } from 'react';
import { Button, Intent, H5, Classes as CoreClasses } from '@blueprintjs/core';
import { Popover2, Classes as PopoverClasses } from '@blueprintjs/popover2';
import clsx from 'clsx';
import { kebabCase } from '../utils';

type SaveGameProps = {
  gameFileDirectory: string;
  onMapNameConfirm: (name: string, path: string) => void;
};

export const SaveGamePop = ({
  gameFileDirectory,
  onMapNameConfirm,
}: SaveGameProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mapName, setMapName] = useState('');
  const [completeMapPath, setCompleteMapPath] = useState('');

  const mapNameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setMapName(newName);
    setCompleteMapPath(`${gameFileDirectory}/${kebabCase(newName)}`);
  };

  const mapNameConfirmHandler = () => {
    onMapNameConfirm(mapName, completeMapPath);
  };

  const openedUpHandler = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <Popover2
      placement="auto"
      onOpened={openedUpHandler}
      content={
        <div className="p-2 w-96 bg-slate-200">
          <div className="bg-white p-2">
            <H5 className="text-center border-b border-gray-500 pb-2 ">
              Save New Game Map
            </H5>
            <label className={CoreClasses.LABEL} htmlFor="gameName">
              Map Name:
              <input
                id="gameName"
                type="text"
                ref={inputRef}
                className={clsx(CoreClasses.INPUT, 'inline-block ml-8 w-60')}
                onChange={mapNameChangeHandler}
              />
            </label>
            <div className="pb-2">
              <h5 className="pb-1">Saved File Path:</h5>
              <input
                readOnly
                className="text-xs text-gray-500 p-1 bg-slate-100 w-full focus:outline-none"
                value={completeMapPath}
              />
            </div>
            <div className="flex justify-center my-2 gap-4">
              <Button className={clsx(PopoverClasses.POPOVER2_DISMISS, 'w-24')}>
                Cancel
              </Button>
              <Button
                intent={Intent.SUCCESS}
                className={clsx(PopoverClasses.POPOVER2_DISMISS, 'w-24')}
                onClick={mapNameConfirmHandler}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <Button
        icon="floppy-disk"
        title="Save Map"
        intent="primary"
        className="focus:outline-0"
      />
    </Popover2>
  );
};
