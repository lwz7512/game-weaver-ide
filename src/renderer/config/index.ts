export * from './types';
export * from './labels';

export const port = 8088;
export const gamePreviewDefaultURL = `http://localhost:${port}`;
export const sourceRepo =
  'https://raw.githubusercontent.com/lwz7512/game-weaver-ast/master/';

export const GWMAPFILE = '.gw';

export const badgeImages = {
  bravery: {
    url: `${sourceRepo}images/badge/challenge_badge_brave.png`,
    score: 1,
  },
  beginner: {
    url: `${sourceRepo}images/badge/challenge_badge_beginner.png`,
    score: 10,
  },
  junior: {
    url: `${sourceRepo}images/badge/challenge_badge_junior.png`,
    score: 30,
  },
  master: {
    url: `${sourceRepo}images/badge/challenge_badge_master.png`,
    score: 60,
  },
  graduation: {
    url: `${sourceRepo}images/badge/challenge_badge_graduation.png`,
    score: 100,
  },
};

// global events
export enum DOMEVENTS {
  GMSPACE_UNDEFINED = 'GMSPACE_UNDEFINED',
}

export enum TSLIB {
  P2 = 'phaser/p2.d.txt',
  PIXI = 'phaser/pixi.comments.d.txt',
  PHASER = 'phaser/phaser.comments.d.txt',
  FACTS = 'ts:filename/facts.d.ts',
  GLOBAL = 'challenges/global.d.txt',
}

export const libSource = [
  'declare class Facts {',
  '    /**',
  '     * Returns the next fact',
  '     */',
  '    static next():string',
  '}',
].join('\n');

export enum ROUTES {
  WELCOME = '/',
  CODE = '/codeditor',
  BLOCKS = '/codeblocks',
  TILED = '/tiled',
  LEARN = '/learn',
  PROJECTS = '/projects',
  GAMES = '/games',
  CHALLENGE = '/challenge/:id',
  USER = '/user',
  SETTING = '/settings',
}

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
