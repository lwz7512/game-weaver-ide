import * as React from 'react';
import { useState, useCallback } from 'react';
import { IpcEvents } from '../../ipc-events';
import { useLocalStorage } from './useLocalStorage';

export const useDeleteGameDialog = (onDeleted: () => void) => {
  const { ipcRenderer } = window.electron;

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const handleDeleteClose = useCallback(() => setIsOpen(false), []);
  const [deletedGame, setDeletedGame] = useState('');

  const { spacePath } = useLocalStorage();

  const openDeleteGameDialog = (folder: string) => {
    setIsOpen(true);
    setDeletedGame(folder); // save it
  };

  const handleDeleteConfirm = async () => {
    if (!deletedGame || !spacePath) return;

    setIsLoading(true); // start deleting...

    // delete the folder under workspace
    const path = `${spacePath}/${deletedGame}`;
    await ipcRenderer.invoke(IpcEvents.DELETE_GAME_FOLDER, path);

    setIsLoading(false);

    onDeleted();
    // waiting for refresh game list...
    setTimeout(handleDeleteClose, 100);
  };

  return {
    isLoading,
    isOpen,
    deletedGame,
    openDeleteGameDialog,
    handleDeleteClose,
    handleDeleteConfirm,
  };
};
