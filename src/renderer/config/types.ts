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
