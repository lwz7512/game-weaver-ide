import { TabId } from '@blueprintjs/core';

export enum MODULETYPES {
  WELCOME = 'Welcome',
  CODE = 'CodeEditor',
  BLOCKS = 'CodeBlocks',
  TILED = 'TilEditor',
  LEARN = 'Learning',
  PROJECTS = 'Projects',
  USER = 'User',
  SETTING = 'Settings',
}

export enum ROUTES {
  WELCOME = '/',
  CODE = '/codeditor',
  BLOCKS = '/codeblocks',
  TILED = '/tiled',
  LEARN = '/learn',
  PROJECTS = '/projects',
  USER = '/user',
  SETTING = '/settings',
}

export const MODULEROUTES = {
  [MODULETYPES.WELCOME as string]: ROUTES.WELCOME,
  [MODULETYPES.CODE as string]: ROUTES.CODE,
  [MODULETYPES.BLOCKS as string]: ROUTES.BLOCKS,
  [MODULETYPES.TILED as string]: ROUTES.TILED,
  [MODULETYPES.LEARN as string]: ROUTES.LEARN,
  [MODULETYPES.PROJECTS as string]: ROUTES.PROJECTS,
  [MODULETYPES.USER as string]: ROUTES.USER,
  [MODULETYPES.SETTING as string]: ROUTES.SETTING,
};

export const codeEditorOptions = {
  fontSize: 14,
  minimap: {
    enabled: false, // TODO: config on global settings
  },
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 3, // default is 5
  // contextmenu: false,
};
