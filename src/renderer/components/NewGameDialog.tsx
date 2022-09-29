import clsx from 'clsx';
import { ChangeEvent, useCallback, useState, useRef, useEffect } from 'react';
import {
  Tab,
  Tabs,
  Dialog,
  Classes,
  Button,
  FormGroup,
  InputGroup,
  Card,
  Elevation,
  Icon,
  IconName,
  Spinner,
} from '@blueprintjs/core';

import { GAMETYPES, GAME_DIALOG_TITLE, GAME_PATH_EXISTS } from '../config';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { kebabCase } from '../utils';

type GameDialogProps = {
  isOpen: boolean;
  handleClose: () => void;
  checkSavePathExist: (path: string) => Promise<boolean>;
  createGameProject: (template: string, savePath: string) => Promise<boolean>;
  onGameCreateSuccess: () => void;
};

const dialogProps = {
  autoFocus: false,
  canEscapeKeyClose: true,
  canOutsideClickClose: false,
  enforceFocus: false,
  shouldReturnFocusOnClose: true,
  usePortal: true,
  title: GAME_DIALOG_TITLE,
};

export const NewGameDialog = ({
  isOpen,
  handleClose,
  checkSavePathExist,
  createGameProject,
  onGameCreateSuccess,
}: GameDialogProps) => {
  const [selecedTemplate, setSelecedTemplate] = useState('basic');
  const [gameName, setGameName] = useState('');
  const [gamePath, setGamePath] = useState('');
  const [errorInfo, setErrorInfo] = useState('');
  const [saving, setSaving] = useState(false);
  const [disableCreate, setDisableCreate] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { spacePath } = useLocalStorage();

  const gameInputHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const regex = /^[a-zA-Z\s]*$/;
    const input = event.target.value;
    if (regex.test(input)) {
      setGameName(input);
      setGamePath(`${spacePath}/${kebabCase(input)}`);
      setDisableCreate(false);
    } else {
      setDisableCreate(true);
    }
  };

  // 1. check folder existence, if exist couldnt save, warning user.
  // 2. if pass check, download template and create to local
  const createNewGameHandler = async () => {
    setDisableCreate(true);
    // check path validity first
    const exist = await checkSavePathExist(gamePath);
    if (exist) {
      return setErrorInfo(GAME_PATH_EXISTS);
    }
    setSaving(true);
    const success = await createGameProject(selecedTemplate, gamePath);
    if (success) {
      handleClose();
      setSaving(false);
      onGameCreateSuccess();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200); // need some time to fully rendering input
    }
  }, [isOpen]);

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} {...dialogProps}>
      {/* dialog body */}
      <div className={Classes.DIALOG_BODY}>
        <FormGroup
          disabled={false}
          helperText=""
          inline={false}
          intent="primary"
          label="New Game Name"
          labelFor="gameName"
          labelInfo="(required)"
          className="px-2 text-black"
        >
          <InputGroup
            id="gameName"
            inputRef={inputRef}
            placeholder="Your New Game Name"
            disabled={false}
            intent="primary"
            className="w-1/2"
            value={gameName}
            onChange={gameInputHandler}
          />
        </FormGroup>
        <FormGroup
          disabled={false}
          helperText={errorInfo}
          inline={false}
          intent="primary"
          label="Game saving path"
          labelFor="gamePath"
          labelInfo="(readOnly)"
          className="has-warning pl-2 pr-4 text-black"
        >
          <InputGroup
            readOnly
            id="gamePath"
            placeholder="Your New Game Path"
            intent="primary"
            className="w-full"
            value={gamePath}
          />
        </FormGroup>
        <h2 className="text-sm p-2">Game Template Select:</h2>
        <div className="flex gap-4 p-2">
          {GAMETYPES.map((gt) => (
            <Card
              key={gt.type}
              interactive
              elevation={Elevation.TWO}
              className={clsx(
                'p-2 w-24 h-24 text-center border-4',
                selecedTemplate === gt.type ? 'border-blue-600' : ''
              )}
              onClick={() => setSelecedTemplate(gt.type)}
            >
              <div className="p-2">
                <Icon icon={gt.icon as IconName} size={36} color="blue" />
              </div>
              <h5 className="text-sm">{gt.name}</h5>
            </Card>
          ))}
        </div>
      </div>
      {/* dialog footer */}
      <div className={Classes.DIALOG_FOOTER}>
        <div className={clsx(Classes.DIALOG_FOOTER_ACTIONS, 'px-4 pt-4')}>
          <Button onClick={handleClose} className="px-4 py-2 mr-4">
            Cancel
          </Button>
          <Button
            disabled={disableCreate}
            icon="folder-new"
            intent="primary"
            className="px-4 py-2"
            onClick={createNewGameHandler}
          >
            {saving ? <Spinner size={18} intent="primary" /> : 'Create'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
