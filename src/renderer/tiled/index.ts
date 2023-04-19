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

/**
 * simple map example:
 * 
 * {
  "backgroundcolor":"#656667",
  "height":4,
  "layers":[ ],
  "nextobjectid":1,
  "orientation":"orthogonal",
  "properties":[
    {
      "name":"mapProperty1",
      "type":"string",
      "value":"one"
    },
    {
      "name":"mapProperty2",
      "type":"string",
      "value":"two"
    }],
  "renderorder":"right-down",
  "tileheight":32,
  "tilesets":[ ],
  "tilewidth":32,
  "version":1,
  "tiledversion":"1.0.3",
  "width":4
}
 * 
 */

/**
 * Structure for phaserjs game map
 * https://github.com/mapeditor/tiled/blob/master/docs/reference/json-map-format.rst
 * The 11 must have properties including:
 * - backgroundcolor,
 * - height,
 * - width,
 * - layers,
 * - tilesets,
 * - tileheight,
 * - tilewidth,
 * - renderorder,
 * - orientation,
 * - properties,
 * - version
 */
export type PhaserMap = {
  /**
   * Hex-formatted color (#RRGGBB or #AARRGGBB) (optional)
   */
  backgroundcolor: string;
  /**
   * Number of tile rows
   */
  height: number;
  /**
   * Number of tile columns
   */
  width: number;
  /**
   * may layers
   */
  layers: PhaserMapLayer[];
  /**
   * tilesheets info
   */
  tilesets: TileSet[];
  /**
   * Map grid height
   */
  tileheight: number;
  /**
   * Map grid width
   */
  tilewidth: number;
  /**
   * right-down (the default), right-up, left-down or left-up (currently only supported for orthogonal maps)
   */
  renderorder: string;
  /**
   * orthogonal, isometric, staggered or hexagonal
   */
  orientation: string; // orthogonal
  /**
   * common properties
   */
  properties: MapPropperty[];
  /**
   * The JSON format version (previously a number, saved as string since 1.6)
   */
  version: string;
  /**
   * map (since 1.0)
   */
  type: string;
  // ============= end of required properties ===============
  /** The class of the map (since 1.9, optional) */
  class?: string;
  /** The compression level to use for tile layer data (defaults to -1, which means to use the algorithm default) */
  compressionlevel?: number;
  /** Length of the side of a hex tile in pixels (hexagonal maps only) */
  hexsidelength?: number;
  /** Whether the map has infinite dimensions */
  infinite: boolean;
  /** Auto-increments for each layer ? */
  nextlayerid?: number;
  /** Auto-increments for each placed object */
  nextobjectid?: number;
  /** X coordinate of the parallax origin in pixels (since 1.8, default: 0) */
  parallaxoriginx?: number;
  /** Y coordinate of the parallax origin in pixels (since 1.8, default: 0) */
  parallaxoriginy?: number;

  /** x or y (staggered / hexagonal maps only) */
  staggeraxis?: string;
  /** odd or even (staggered / hexagonal maps only) */
  staggerindex?: string;
  /** The Tiled version used to save the file */
  tiledversion?: string;
};

/**
 * tile layer example:
 * {
  "data":[1, 2, 1, 2, 3, 1, 3, 1, 2, 2, 3, 3, 4, 4, 4, 1],
  "height":4,
  "name":"ground",
  "opacity":1,
  "properties":[
    {
      "name":"tileLayerProp",
      "type":"int",
      "value":1
    }],
  "type":"tilelayer",
  "visible":true,
  "width":4,
  "x":0,
  "y":0
}
 */

/**
 * object layer example:
 * {
  "draworder":"topdown",
  "height":0,
  "name":"people",
  "objects":[ ],
  "opacity":1,
  "properties":[
    {
      "name":"layerProp1",
      "type":"string",
      "value":"someStringValue"
    }],
  "type":"objectgroup",
  "visible":true,
  "width":0,
  "x":0,
  "y":0
}
 */

/**
 * =======================================================
 * Phaserjs layer structure:
 * there are two type of layer, tile layer & object layer
 * =======================================================
 * * 12 must have properties including: **
 * - name,
 * - type,
 * - data,
 * - draworder,
 * - height,
 * - width,
 * - x,
 * - y,
 * - visible,
 * - opacity,
 * - objects,
 * - properties
 *
 */
export type PhaserMapLayer = {
  /**
   * Name assigned to this layer
   */
  name: string;
  /**
   * tilelayer, objectgroup, imagelayer or group
   */
  type: string;
  /**
   * Array of unsigned int (GIDs) or base64-encoded data. tilelayer only.
   */
  data: number[];
  /**
   * Array of :ref:`objects <json-object>`. objectgroup only.
   */
  objects: HitObject[];
  /**
   * topdown (default) or index. objectgroup only.
   */
  draworder: string;
  /**
   * Row count. Same as map height for fixed-size maps. tilelayer only.
   */
  height: number;
  /**
   * Column count. Same as map width for fixed-size maps. tilelayer only.
   */
  width: number;
  /**
   * Horizontal layer offset in tiles. Always 0.
   */
  x: number;
  /**
   * Vertical layer offset in tiles. Always 0.
   */
  y: number;
  /**
   * Whether layer is shown or hidden in editor
   */
  visible: boolean;
  /**
   * Value between 0 and 1
   */
  opacity: number;
  /**
   * layer properties, saving what?
   */
  properties: MapPropperty[];
  // ============= end of required properties ===============
  chunks?: MapChunk[];
  /** The class of the layer (since 1.9, optional) */
  class?: string;
  /** zlib, gzip, zstd (since Tiled 1.3) or empty (default). tilelayer only. */
  compression?: string;
  /** csv (default) or base64. tilelayer only. */
  encoding?: string;
  /** Incremental ID - unique across all layers */
  id?: number;
  /** Image used by this layer. imagelayer only. */
  image?: string;
  /** Array of :ref:`layers <json-layer>`. group only */
  layers?: PhaserMapLayer[];
  /** Whether layer is locked in the editor (default: false). (since Tiled 1.8.2) */
  locked?: boolean;
  /** Horizontal layer offset in pixels (default: 0) */
  offsetx?: number;
  /** Vertical layer offset in pixels (default: 0) */
  offsety?: number;
  /** Horizontal :ref:`parallax factor <parallax-factor>` for this layer (default: 1). (since Tiled 1.5) */
  parallaxx?: number;
  /** Vertical :ref:`parallax factor <parallax-factor>` for this layer (default: 1). (since Tiled 1.5) */
  parallaxy?: number;
  /** Whether the image drawn by this layer is repeated along the X axis. imagelayer only. (since Tiled 1.8) */
  repeatx?: boolean;
  /** Whether the image drawn by this layer is repeated along the Y axis. imagelayer only. (since Tiled 1.8) */
  repeaty?: boolean;
  /** X coordinate where layer content starts (for infinite maps) */
  startx?: number;
  /** Y coordinate where layer content starts (for infinite maps) */
  starty?: number;
  /**
   * Hex-formatted :ref:`tint color <tint-color>` (#RRGGBB or #AARRGGBB)
   * that is multiplied with any graphics drawn by this layer or any child layers (optional).
   */
  tintcolor?: string;
  /** Hex-formatted color (#RRGGBB) (optional). imagelayer only. */
  transparentcolor?: string;
};

/**
 * Tileset example:
 * {
 "columns":19,
 "firstgid":1,
 "image":"..\/image\/fishbaddie_parts.png",
 "imageheight":480,
 "imagewidth":640,
 "margin":3,
 "name":"",
 "properties":[
   {
     "name":"myProperty1",
     "type":"string",
     "value":"myProperty1_value"
   }],
 "spacing":1,
 "tilecount":266,
 "tileheight":32,
 "tilewidth":32
}
 */

/**
 * tilesheet info
 * 12 must have properties:
 * - name,
 * - columns,
 * - firstgid,
 * - image,
 * - imageheight,
 * - imagewidth,
 * - margin,
 * - spacing,
 * - tilecount,
 * - tileheight,
 * - tilewidth,
 * - properties
 */
export type TileSet = {
  /**
   * Name given to this tileset, important to have as a key to find the tiles data
   */
  name: string;
  /**
   * The number of tile columns in the tileset
   */
  columns: number;
  /**
   * GID corresponding to the first tile in the set
   */
  firstgid: number; // 1
  /**
   * Image file path used for tiles in this set
   */
  image: string;
  /**
   * Height of source image in pixels
   */
  imageheight: number;
  /**
   * Width of source image in pixels
   */
  imagewidth: number;
  /**
   * Buffer between image edge and first tile (pixels)
   */
  margin: number;
  /**
   * Spacing between adjacent tiles in image (pixels)
   */
  spacing: number;
  /**
   * The number of tiles in this tileset
   */
  tilecount: number;
  /**
   * Maximum height of tiles in this set
   */
  tileheight: number;
  /**
   * Maximum width of tiles in this set
   */
  tilewidth: number;
  /**
   * tileset properties
   */
  properties: MapPropperty[];
  // ============= end of required properties ===============
  /** Hex-formatted color (#RRGGBB or #AARRGGBB) (optional) */
  backgroundcolor?: string;
  /** The class of the tileset (since 1.9, optional) */
  class?: string;
  /** The fill mode to use when rendering tiles from this tileset (stretch (default) or preserve-aspect-fit) (since 1.9) */
  fillmode?: string;
  /** :ref:`json-tileset-grid` */
  grid?: any;
  /**
   * Alignment to use for tile objects  (since 1.4)
   * (unspecified (default), topleft, top, topright, left, center, right, bottomleft, bottom or bottomright)
   */
  objectalignment?: string;
  /** The external file that contains this tilesets data */
  source?: string;
  /** Array of :ref:`Terrains <json-terrain>` (optional) */
  terrains?: any[];
  /** The Tiled version used to save the file */
  tiledversion?: string;
  /** ... */
  tileoffset?: any;
  /** The size to use when rendering tiles from this tileset on a tile layer (tile (default) or grid) (since 1.9) */
  tilerendersize?: string;
  /** Array of :ref:`Tiles <json-tile>` (optional) */
  tiles?: any;
  /** ??... */
  transformations?: any;
  /** Hex-formatted color (#RRGGBB) (optional) */
  transparentcolor?: string;
  /** tileset (for tileset files, since 1.0) */
  type?: string;
  /** The JSON format version (previously a number, saved as string since 1.6) */
  version?: string;
  /** ??.. */
  wangsets?: any[];
};

/**
 * layer tile legend for map
 */
export type TileLegend = {
  textureId: number;
  active: boolean;
};

export type MapPropperty = {
  name: string;
  type: string;
  value: string;
};

export type MapChunk = {
  /** Array of unsigned int (GIDs) or base64-encoded data */
  data: number[];
  /** Height in tiles */
  height: number;
  /** Width in tiles */
  width: number;
  /** X coordinate in tiles */
  x: number;
  /** Y coordinate in tiles */
  y: number;
};

export type HitObject = {
  /** Used to mark an object as an ellipse */
  ellipse: boolean;
  /** Global tile ID, only if object represents a tile */
  gid: number;
  /** Height in pixels. */
  height: number;
  /** Incremental ID, unique across all objects */
  id: number;
  /** String assigned to name field in editor */
  name: string;
  /** Used to mark an object as a point */
  point: boolean;
  /** Array of :ref:`Points <json-point>`, in case the object is a polygon */
  polygon: MapPoint[];
  /** Array of :ref:`Points <json-point>`, in case the object is a polyline */
  polyline: MapPoint[];
  /** Array of :ref:`Properties <json-property>` */
  properties: MapPropperty[];
  /** Angle in degrees clockwise */
  rotation: number;
  /** Reference to a template file, in case object is a :doc:`template instance </manual/using-templates>` */
  template: string;
  /** Only used for text objects */
  text: MapText;
  /** The class of the object (was saved as class in 1.9, optional) */
  type: string;
  /** Whether object is shown in editor. */
  visible: boolean;
  /** Width in pixels. */
  width: number;
  /** X coordinate in pixels */
  x: number;
  /** Y coordinate in pixels */
  y: number;
};

export type MapPoint = {
  /** X coordinate in pixels */
  x: number;
  /** Y coordinate in pixels */
  y: number;
};

export type MapText = {
  /** Whether to use a bold font (default: false) */
  bold: boolean;
  /** Hex-formatted color (#RRGGBB or #AARRGGBB) (default: #000000) */
  color: string;
  /** Font family (default: sans-serif) */
  fontfamily: string;
  /** Horizontal alignment (center, right, justify or left (default)) */
  halign: string;
  /** Whether to use an italic font (default: false) */
  italic: boolean;
  /** Whether to use kerning when placing characters (default: true) */
  kerning: boolean;
  /** Pixel size of font (default: 16) */
  pixelsize: number;
  /** Whether to strike out the text (default: false) */
  strikeout: boolean;
  /** Text */
  text: string;
  /** Whether to underline the text (default: false) */
  underline: boolean;
  /** Vertical alignment (center, bottom or top (default)) */
  valign: string;
  /** Whether the text is wrapped within the object bounds (default: false) */
  wrap: boolean;
};
