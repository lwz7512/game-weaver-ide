import { DOMEVENTS, GWSPACE_KEY } from '../config';

const checkWorkspacePath = (): string => {
  const path = localStorage.getItem(GWSPACE_KEY);
  return path || '';
};

export const saveWorkspacePath = (path: string): void => {
  localStorage.setItem(GWSPACE_KEY, path);
};

export const safeActionWithWorkspace = (callback: (gmPath: string) => void) => {
  const gmWorkspacePath = localStorage.getItem(GWSPACE_KEY);
  if (gmWorkspacePath) {
    callback(gmWorkspacePath);
  } else {
    document.dispatchEvent(new Event(DOMEVENTS.GMSPACE_UNDEFINED));
  }
};
