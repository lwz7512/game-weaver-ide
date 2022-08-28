// export {}

export const saveWorkspacePath = (path: string): void => {
  localStorage.setItem('workspace', path);
};

export const checkWorkspacePath = (): string => {
  const path = localStorage.getItem('workspace');
  return path || '';
};
