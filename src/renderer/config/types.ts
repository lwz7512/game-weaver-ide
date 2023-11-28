type PreLearnItem = {
  name: string;
  url: string;
  title: string;
};

export type Challenge = {
  /** challenge number */
  id: number;
  /** challenge name */
  name: string;
  /** challenge description */
  description: string;
  /** challenge target */
  objective: string;
  /** challenge knowledge points */
  keywords: string[];
  /** problems to be solved before coding */
  keypoints: string[];
  /** difficulty degree */
  level: number;
  /** video introduction path to this challenge */
  videoURL: string;
  /** video subtitle path with English/Chinse version  */
  videoSubtitle: string;
  /** learning task before start coding */
  prerequsite: PreLearnItem[];
  /** base code */
  baseCode: string;
  /** coding start point loaded from remote repository */
  startCode: string;
  /** code testing method or code auditor function defined in challenges.js */
  testCode: string;
  /** code snippet for challenge completion */
  finalCode: string;
  /** if current challenge is in use */
  selected?: boolean;
  /** banner image path */
  bannerURL?: string;
  /** completed all the tests of current challenge */
  completed?: boolean;
};

export type TileSheetImage = {
  path: string;
  tileSize: number;
  space: number;
};

export type SaveHistory = {
  /** map name */
  name: string;
  /** map file path */
  path: string;
};

export type ConfigType = {
  [key: string]: string | unknown[];
};

export type ExampleSource = {
  folder: string;
  label: string;
  files: string[];
};

export type JSFILE = 'main' | 'success' | 'failure';

export type TemplateCodeType = {
  [k in JSFILE]: string;
};

export type IFrameContext = {
  url: string;
  timerId: NodeJS.Timeout | undefined;
  handler: (...args: unknown[]) => void;
};

// export type DrawingSession = {
//   [key: string]: number | string;
// };

export type GeneralObject = {
  [key: string]: boolean | number | string | number[] | string[];
};

/**
 * for now only support one source image.
 * TODO: support multiple souce images...
 * @2023/01/14
 */
export type GameMapXportParams = {
  /** tilesheet image URL, the same as `selectedImage` */
  sourceImage: string;
  mapHeight: string;
  mapWidth: string;
  tileHeight: string;
  tileWidth: string;
  mapHeightChangeHandler: (field: string) => void;
  mapWidthChangeHandler: (field: string) => void;
  tileHeightChangeHandler: (field: string) => void;
  tileWidthChangeHandler: (field: string) => void;
  setAllDimension: (mh: number, mw: number, th: number, tw: number) => void;
};
