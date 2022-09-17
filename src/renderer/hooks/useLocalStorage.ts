import { useState, useEffect } from 'react';
import { saveWorkspacePath, safeActionWithWorkspace } from '../state/storage';

export const useLocalStorage = () => {
  const [spacePath, setSpacePath] = useState('');
  // use selected workspace path
  const initGMSpacePath = (path: string) => {
    saveWorkspacePath(path);
    setSpacePath(path);
  };

  useEffect(() => {
    safeActionWithWorkspace((gmPath) => {
      setSpacePath(gmPath); // display in setting page
    });
  }, []);

  return {
    spacePath,
    initGMSpacePath,
  };
};
