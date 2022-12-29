export type GameTilesLayer = {
  id: number;
  x?: number;
  y?: number;
  name: string;
  height: number; // vertical tiles amount
  width: number; // horizontal tiles amount
  opacity?: number;
  type?: string; // ???
  visible: boolean;
  locked: boolean; // locked
  selected: boolean; // selected
  grid: number[][]; // hold painted tile id
  zIndex: number; // current y position of
};

export type TileLegend = {
  textureId: number;
  active: boolean;
};
