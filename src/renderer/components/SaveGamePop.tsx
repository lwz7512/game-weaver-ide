import clsx from 'clsx';
import React, { ChangeEvent, useEffect, useState, useRef } from 'react';
import { Button, Intent, H5, Classes as CoreClasses } from '@blueprintjs/core';
import { Popover2, Classes as PopoverClasses } from '@blueprintjs/popover2';
import { kebabCase } from '../utils';
import { GWMAPFILE } from '../config';

// type MapProperties = {
//   mapName: string;
//   savePath: string;
// };

const genGameMapFullpath = (gameDir: string, mapName: string) => {
  return `${gameDir}/${kebabCase(mapName)}${GWMAPFILE}`;
};

type SaveGameProps = {
  savedMapName?: string;
  gameFileDirectory: string;
  onMapNameConfirm: (name: string, path: string) => void;
};

export const SaveGamePop = ({
  savedMapName,
  gameFileDirectory,
  onMapNameConfirm,
}: SaveGameProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mapName, setMapName] = useState('');
  const [completeMapPath, setCompleteMapPath] = useState('');

  const mapNameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setMapName(newName);
    const fullPath = genGameMapFullpath(gameFileDirectory, newName);
    setCompleteMapPath(fullPath);
  };

  const mapNameConfirmHandler = (event: React.MouseEvent) => {
    if (!mapName) return event.stopPropagation(); // prevent saving empty
    onMapNameConfirm(mapName, completeMapPath);
  };

  const openedUpHandler = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  useEffect(() => {
    if (!gameFileDirectory) return;
    setCompleteMapPath(gameFileDirectory);
  }, [gameFileDirectory]);

  useEffect(() => {
    if (!savedMapName || !gameFileDirectory) {
      setMapName('');
      setCompleteMapPath('');
      return;
    }
    // reset map name and full path
    setMapName(savedMapName);
    const fullPath = genGameMapFullpath(gameFileDirectory, savedMapName);
    setCompleteMapPath(fullPath);
  }, [savedMapName, gameFileDirectory]);

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
                value={mapName}
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
