export * from './types';
export * from './labels';

export const port = 8088;
export const gamePreviewDefaultURL = `http://localhost:${port}`;
export const sourceRepo =
  'https://raw.githubusercontent.com/lwz7512/game-weaver-ast/master/';

export const GWSPACE_KEY = 'workspace'; // DO NOT CHANGE
export const HISTORY_KEY = 'mapfiles'; // saved map source file list
export const GWMAPFILE = '.gw';

// global events
export enum DOMEVENTS {
  GMSPACE_UNDEFINED = 'GMSPACE_UNDEFINED',
}

export enum TSLIB {
  P2 = 'phaser/p2.d.txt',
  PIXI = 'phaser/pixi.comments.d.txt',
  PHASER = 'phaser/phaser.comments.d.txt',
  FACTS = 'ts:filename/facts.d.ts',
}

export const libSource = [
  'declare class Facts {',
  '    /**',
  '     * Returns the next fact',
  '     */',
  '    static next():string',
  '}',
].join('\n');

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
  language: 'javascript',
  minimap: {
    enabled: false, // TODO: config on global settings
  },
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 2, // default is 5
  // contextmenu: false,
};

/**
 * for new game dialog game template selection
 */
export const GAMETYPES = [
  {
    type: 'basic',
    name: 'Basic',
    icon: 'applications',
  },
  {
    type: 'arcade',
    name: 'Arcade',
    icon: 'console',
  },
  {
    type: 'box2d',
    name: 'Box2D',
    icon: 'helper-management',
  },
  {
    type: 'platformer',
    name: 'Platformer',
    icon: 'heat-grid',
  },
];
