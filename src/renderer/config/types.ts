type PreLearnItem = {
  name: string;
  url: string;
  title: string;
};

type Decoration = {
  /** todo|mark */
  type: string;
  /** line start, line end */
  position: number[];
};

export type ChallengeRecord = {
  id: number;
  /** completion date */
  date: string;
  /** status: completed | touched */
  status: string;
};

/**
 * Coding Game Challenge Project
 */
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
  /** video cover image relative path */
  cover: string;
  /** challenge item thumbnail path in sidebard disaplayed on hover */
  thumbnail: string;
  /** video introduction path to this challenge */
  videoURL: string;
  /** video subtitle path with English/Chinse version  */
  videoSubtitle: string;
  /** learning task before start coding */
  prerequisite: PreLearnItem[];
  /** base code */
  baseCode: string;
  /** coding start point loaded from remote repository */
  startCode: string;
  /** code testing method or code auditor function defined in challenges.js */
  testCode: string;
  /** code snippet for challenge completion */
  finalCode: string;
  /** project create date */
  createDate: string;
  /* ======  runtime properties ====== */
  /** if current challenge is in use */
  selected?: boolean;
  /** banner image path */
  bannerURL?: string;
  /** completed all the tests of current challenge */
  completed?: boolean;
  /** if touched, run button pressed */
  touched?: boolean;
  /** full cover url */
  coverURL?: string;
  /** code hightlights */
  codeDecorations: Decoration[];
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
