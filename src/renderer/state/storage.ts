import { DOMEVENTS, GWSPACE_KEY, HISTORY_KEY, SaveHistory } from '../config';

const checkWorkspacePath = (): string => {
  const path = localStorage.getItem(GWSPACE_KEY);
  return path || '';
};

export const saveWorkspacePath = (path: string): void => {
  localStorage.setItem(GWSPACE_KEY, path);
};

export const clearWorkspaceInexisted = () => {
  localStorage.removeItem(GWSPACE_KEY);
};

export const safeActionWithWorkspace = (callback: (gmPath: string) => void) => {
  const gmWorkspacePath = localStorage.getItem(GWSPACE_KEY);
  if (gmWorkspacePath) {
    callback(gmWorkspacePath);
  } else {
    document.dispatchEvent(new Event(DOMEVENTS.GMSPACE_UNDEFINED));
  }
};

export const saveMapHistory = (name: string, path: string): void => {
  const savedFiles = localStorage.getItem(HISTORY_KEY);
  const fileList: SaveHistory[] = savedFiles ? JSON.parse(savedFiles) : [];
  // check existence
  const saved = fileList.find((f) => f.name === name);
  if (saved) return;
  fileList.unshift({ name, path });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(fileList));
};

export const getMapHistory = (): SaveHistory[] => {
  const savedFiles = localStorage.getItem(HISTORY_KEY);
  return savedFiles ? JSON.parse(savedFiles) : [];
};
