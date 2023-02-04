export type MapLayer = {
  id: number;
  name: string;
  selected: boolean;
  editMode: boolean;
};

export type SaveHistory = { name: string; path: string };

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
  /** single source only */
  sourceImage: string;
  mapHeight: string;
  mapWidth: string;
  tileHeight: string;
  tileWidth: string;
};
