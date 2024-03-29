import { DOMEVENTS, SaveHistory, ChallengeRecord } from '../config';

const MISSION_KEY = 'challenges';
const GWSPACE_KEY = 'workspace'; // DO NOT CHANGE
const HISTORY_KEY = 'mapfiles'; // saved map source file list

export const getUserScore = () => {
  const savedMissions = localStorage.getItem(MISSION_KEY);
  const record = JSON.parse(savedMissions || '[]') as any[];
  return record.length;
};

export const getCompletedChallenges = (): ChallengeRecord[] => {
  const savedMissions = localStorage.getItem(MISSION_KEY);
  return savedMissions ? JSON.parse(savedMissions) : [];
};

export const saveChallengeCompletion = (id: number, status = 'completed') => {
  const savedMissions = localStorage.getItem(MISSION_KEY);
  const missionList: ChallengeRecord[] = savedMissions
    ? JSON.parse(savedMissions)
    : [];
  const hasCompleted = missionList.find(
    (c) => c.id === id && c.status === 'completed'
  );
  // already completed, do nothing! - 2024/03/06
  if (hasCompleted) return;

  const newMission = {
    id,
    date: new Date().toISOString(),
    status,
  };
  const missionWithNew = missionList
    .filter((m) => m.id !== id) // remove lastly saved one
    .concat(newMission);
  localStorage.setItem(MISSION_KEY, JSON.stringify(missionWithNew));
};

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
