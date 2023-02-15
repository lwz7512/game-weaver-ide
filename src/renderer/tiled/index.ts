/**
 * Game weaver map structure
 */
export type GWMap = {
  /** Game Full Name */
  name: string;
  /** hori-tile-size */
  mapWidth: number;
  /** vert-tile-size */
  mapHeight: number;
  /** width in pixel */
  tileWidth: number;
  /** height in pixel */
  tileHeight: number;
  /** tilesheet file path */
  tilesetImage: string;
  layers: GameWeaverLayer[];
};

export type GameWeaverLayer = {
  id: number;
  name: string;
  /** vertical tiles amount */
  height: number;
  /** horizontal tiles amount */
  width: number;
  /** show or hide */
  visible: boolean;
  /** locked */
  locked: boolean;
  /** selected */
  selected: boolean;
  /** hold painted tile id */
  grid: number[][];
  /** current y position of layer */
  zIndex: number;
  x?: number;
  y?: number;
};

export type MapLayer = {
  id: number;
  name: string;
  selected: boolean;
  editMode: boolean;
  unlocked: boolean;
  visible: boolean;
};

export type TileSet = {
  name: string;
  columns: number;
  firstgid: number; // 1
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  spacing: number;
  tilecount: number;
  tileheight: number;
  tilewidth: number;
};

/**
 * Structure for phaserjs game map
 */
export type PhaserMap = {
  type: string; // map
  width: number;
  height: number;
  infinite: boolean;
  orientation: string; // orthogonal
  renderorder: string; // right-down
  tileheight: number;
  tilewidth: number;
  layers: PhaserMapLayer[];
  tilesets: TileSet[];
  /** phaser version */
  version: string;
};

/**
 * for phaserjs game json export
 */
export type PhaserMapLayer = {
  id: number;
  x: number;
  y: number;
  name: string;
  height: number;
  width: number;
  opacity: number;
  visible: boolean;
  data: number[];
  type: string;
};

/**
 * layer tile legend for map
 */
export type TileLegend = {
  textureId: number;
  active: boolean;
};
