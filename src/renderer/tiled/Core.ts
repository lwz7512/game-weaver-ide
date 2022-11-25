/**
 * Created at 2022/10/10
 */
import * as PIXI from 'pixi.js';
import { EventSystem } from '@pixi/events';
import { Graphics, Rectangle, Sprite } from 'pixi.js';
import { BaseEditor, rectEquals, GameTilesLayer } from './Base';
import { GeneralObject } from '../config';
import {
  setDrawingSession,
  getSessionBy,
  clearPaintedTiles,
} from '../state/session';
import { getTileSheetBy, resetCachedTextures } from '../state/cache';

export class TiledCore extends BaseEditor {
  rootElement: HTMLElement;

  appWidth: number;
  appHeight: number;

  gameHoriTiles = 0; // horizontal tiles count
  gameVertTiles = 0; // vertical tiles count

  tileWidth = 0; // one tile width in pixel
  tileHeight = 0; // one tile height in pixel

  // game map data for multiple layers
  gameMapLayersInfo: GameTilesLayer[] = [];

  app: PIXI.Application | null; // hold the only instance of tile app here!
  screenRect: Rectangle | null = null;

  mapContainer: PIXI.Container | null = null;
  paintedTileMap: PIXI.Container | null = null;
  mapDrawLayer: PIXI.Graphics | null = null;
  hoveredMapLayer: PIXI.Graphics | null = null;
  mapInterectLayer: PIXI.Graphics | null = null;

  cellInfoText: PIXI.Text | null = null;

  pickerContainer: PIXI.Container | null = null;
  pickerTileMap: PIXI.Graphics | null = null;
  pickerInteractLayer: PIXI.Graphics | null = null;
  selectedTileLayer: PIXI.Graphics | null = null;
  lastHoverRectInPicker: PIXI.Rectangle = PIXI.Rectangle.EMPTY;
  lastSelectedRectInPicker: PIXI.Rectangle = PIXI.Rectangle.EMPTY;
  lastSelectedTilePosition: PIXI.Point | null = null; // (x: columnIndex, y: rowIndex)

  mapScale = 0.6;
  mapMarginX = 60;
  mapMarginY = 60;
  mapHeightRatio = 0.7;

  stagePressed = false;
  clickStartXpos = 0;
  clickStartYpos = 0;
  touchedTileMap = false;

  /** loaded tilesheet grid */
  /** initialized in `drawTilePicker` */
  tiles: PIXI.Texture[][] | null = null;
  tilesStartX = 0;
  tilesStartY = 0;
  tileScale = 1;

  /**
   * Painted tile coordinates cache
   * save the relationship with (x_y : sprite) pair
   * key `${x}_${y}` indicate the tile index from tile row and column;
   * value sprite indicate the displayobject in the map
   */
  paintedTilesCache = new Map<string, PIXI.Sprite>();

  // pinch: Pinch | null = null;
  // and more members...

  constructor(parentElement: HTMLElement, width: number, height: number) {
    super();
    this.rootElement = parentElement;
    this.appWidth = width;
    this.appHeight = height;

    const config = {
      width: this.appWidth,
      height: this.appHeight,
      backgroundColor: 0xa1a1aa, // gray: 0xd4d4d8
      resolution: 1,
      resizeTo: parentElement, // adapt to parent element size
    };
    this.app = new PIXI.Application(config);
    this.rootElement.appendChild(this.app.view);

    const { renderer } = this.app;
    // Install the EventSystem
    renderer.addSystem(EventSystem, 'events');
    // Render stage so that it becomes the root target for UI events
    renderer.render(this.app.stage);
  }

  /**
   * Run the main functions for the tile tool
   */
  create(session?: GeneralObject): PIXI.Application {
    if (session) this.resetFromSession(session);

    const safeApp = this.app as PIXI.Application;
    this.init(safeApp);
    this.drawEditorStage();
    return safeApp;
  }

  /**
   * reset the game parameter befor `run`
   */
  resetFromSession(detail: GeneralObject) {
    if (detail.mapMarginX) {
      this.mapMarginX = detail.mapMarginX as number;
    }
    if (detail.mapMarginY) {
      this.mapMarginY = detail.mapMarginY as number;
    }
    if (detail.mapScale) {
      this.mapScale = detail.mapScale as number;
    }
    // TODO: restore other map info ?
    // 1. restore selected tile
    // 2. restore selected eraser
  }

  /**
   * Set editor stage and draw map grid
   *
   * @param mapWidth
   * @param mapHeight
   * @param tileWidth
   * @param tileHeight
   */
  layout(
    mapWidth: number,
    mapHeight: number,
    tileWidth: number,
    tileHeight: number
  ) {
    this.setGameDimension(mapWidth, mapHeight, tileWidth, tileHeight);
    this.drawMapGrid();
    this.showCurrentCell('Welcome!');
    const robot = this.pickerTileMap as PIXI.Graphics;
    this.drawTilePickerBackground(robot, tileWidth, tileHeight);
  }

  /**
   * Drawing tiles matrix, gap use global settings by opening tilesheet image
   * And the FIRST PLACE to set `tiles`
   *
   * @param tw
   * @param th
   * @param tiles
   */
  drawTilePicker(tw: number, th: number, tiles: PIXI.Texture[][]) {
    this.tiles = tiles;
    this.tilesStartX = 0;
    this.tilesStartY = 0;
    this.tileScale = 1;

    const robot = this.pickerTileMap as PIXI.Graphics;
    robot.removeChildren(); // cleanup before each draw
    this.drawTilePickerBackground(robot, tw, th);
    this.layoutTileGrid(tw, th, this.tiles);
  }

  /**
   * repaint game layer while return to editor from other page
   * @param session
   * @returns
   */
  paintMapLayer(session: GeneralObject) {
    // 1. check cache if have `layerPainted`
    const isLayerPainted = session.layerPainted as boolean;
    if (!isLayerPainted) return;
    // 2. restore tiles
    const cachedSelectedImage = session.selectedImage as string;
    const { textures } = getTileSheetBy(cachedSelectedImage);
    this.tiles = textures;
    // 3. draw map layer
    // TODO: process multiple layers...
    const layerTiles = getSessionBy('layer_1') as number[];
    const rowSize = getSessionBy('rowSize') as number;
    const columnSize = getSessionBy('columnSize') as number;
    for (let i = 0; i < rowSize; i += 1) {
      for (let j = 0; j < columnSize; j += 1) {
        const tileIndex = layerTiles[j + i * columnSize];
        const texture = this.getTextureBy(tileIndex);
        texture && this.paintTextureTo(texture, i, j);
      }
    }
  }

  /**
   * Resize editor canvas when window resize, or reset tile size
   *
   * @param width
   * @param height
   */
  resetApp(width: number, height: number) {
    const size = `width:${width}px;height:${height}px;`;
    const canvas = this.app?.view as HTMLCanvasElement;
    this.rootElement.setAttribute('style', size);
    canvas.setAttribute('width', `${width}`);
    canvas.setAttribute('height', `${height}`);

    if (!this.app) return;
    this.screenRect = this.app.renderer.screen;

    // redraw background and border...
    this.drawEditorStage();
    this.drawMapGrid();
  }

  /**
   * Tile width/height changed
   *
   * @param selectedImage current image
   */
  resetTileSize(selectedImage: string) {
    // console.log(`current tileHeight: ${this.tileHeight}`);
    if (!selectedImage) return; // no tilesheet in use
    const { tw, th } = getTileSheetBy(selectedImage);
    if (!tw || !th) return; // not exsiting
    // size no change, no need to resplit
    if (tw === this.tileHeight && th === this.tileWidth) return;
    // console.log(`tile size changed to resplit sheet!`);
    this.reDrawTilePicker(selectedImage);
    this.clearTileSelection();
    this.eraseAllTileFromGameMap();
    clearPaintedTiles(1);
  }

  zoomIn() {
    if (this.mapScale > 2) return;

    const { fullWidth, fullHeight } = this.getGridFullSize();
    this.mapMarginX -= fullWidth * 0.05;
    this.mapMarginY -= fullHeight * 0.05;
    this.mapScale += 0.1;
    this.drawMapGrid();
    this.saveMapDimension();
  }

  zoomOut() {
    if (this.mapScale < 0.3) return;

    const { fullWidth, fullHeight } = this.getGridFullSize();
    this.mapMarginX += fullWidth * 0.05;
    this.mapMarginY += fullHeight * 0.05;
    this.mapScale -= 0.1;
    this.drawMapGrid();
    this.saveMapDimension();
  }

  zoomToRealSize() {
    this.mapMarginX = 10;
    this.mapMarginY = 10;
    this.mapScale = 1;
    this.drawMapGrid();
    this.saveMapDimension();
  }

  // *************************** end of public api *************************************

  protected saveMapDimension() {
    this.saveSessionChange({
      mapMarginX: this.mapMarginX,
      mapMarginY: this.mapMarginY,
      mapScale: this.mapScale,
    });
  }

  protected saveSessionChange(props: GeneralObject) {
    // `useTiledEditor` handle this event
    this.dispatchEvent(new CustomEvent('session', { detail: props }));
  }

  /**
   * setup editor needed two main sections:
   *
   * 1. Stage section to draw tiles by click and drag arbitrarily.
   * 2. Picker section to offer tile source grid to pickup.
   *
   */
  protected init(app: PIXI.Application) {
    this.screenRect = app.renderer.screen;
    // map container includes:
    // 1. mapDrawLayer
    // 2. paintedTileMap
    // 3. hoveredMapLayer
    // 4. mapInterectLayer
    this.mapContainer = new PIXI.Container();
    app.stage.addChild(this.mapContainer);

    // draw grid, put sprites
    this.mapDrawLayer = new PIXI.Graphics();
    this.mapContainer.addChild(this.mapDrawLayer);

    // put all the selected tile in this layer
    this.paintedTileMap = new PIXI.Container();
    this.mapContainer.addChild(this.paintedTileMap);

    // hold the hovered rectangle over cells
    this.hoveredMapLayer = new PIXI.Graphics();
    this.mapContainer.addChild(this.hoveredMapLayer);

    // add event listeners
    this.mapInterectLayer = new PIXI.Graphics();
    this.mapInterectLayer.interactive = true;
    this.mapContainer.addChild(this.mapInterectLayer);

    // picker container includes:
    // 1. pickerTileMap
    // 2. selectedTileLayer
    // 3. pickerInteractLayer
    this.pickerContainer = new PIXI.Container();
    app.stage.addChild(this.pickerContainer);

    // tile picker at the bottom part
    // includes two parts:
    // 1. background graphics
    // 2. tiles sprites
    this.pickerTileMap = new PIXI.Graphics();
    // // move it to the bottom of map
    this.pickerContainer.addChild(this.pickerTileMap);

    // layer to indicate which tile is selected
    this.selectedTileLayer = new PIXI.Graphics();
    this.pickerContainer.addChild(this.selectedTileLayer);

    // add event listener
    this.pickerInteractLayer = new PIXI.Graphics();
    this.pickerInteractLayer.interactive = true;
    this.pickerContainer.addChild(this.pickerInteractLayer);
  }

  /**
   * save new screenRect and redraw
   */
  protected drawEditorStage() {
    const app = this.app as PIXI.Application;
    this.screenRect = app.renderer.screen;
    // tile grid at the top part
    const mapAreaW = this.screenRect.width;
    const mapAreaH = this.screenRect.height * this.mapHeightRatio;

    const maskTop = new PIXI.Graphics();
    maskTop.beginFill(0xffffff);
    maskTop.drawRect(0, 0, mapAreaW + 1, mapAreaH + 1);
    maskTop.endFill();
    const mapDrawLayer = this.mapDrawLayer as PIXI.Graphics;
    mapDrawLayer.mask = maskTop;

    const mapInterectLayer = this.mapInterectLayer as PIXI.Graphics;
    mapInterectLayer.clear();
    mapInterectLayer.lineStyle(1, 0xf0f0f0, 2);
    mapInterectLayer.beginFill(0x0000ff, 0.001);
    mapInterectLayer.drawRect(0, 0, mapAreaW, mapAreaH);
    mapInterectLayer.endFill();

    const pickerContainer = this.pickerContainer as PIXI.Container;
    pickerContainer.y = this.screenRect.height * this.mapHeightRatio;

    const pickerAreaW = this.screenRect.width;
    const pickerAreaH = this.screenRect.height * 0.3;
    const maskBtm = new PIXI.Graphics();
    maskBtm.beginFill(0xffffff);
    // draw mask to the bottom of map
    maskBtm.drawRect(0, mapAreaH, pickerAreaW + 1, pickerAreaH);
    maskBtm.endFill();
    pickerContainer.mask = maskBtm;

    const pickerInteractLayer = this.pickerInteractLayer as PIXI.Graphics;
    pickerInteractLayer.clear();
    pickerInteractLayer.lineStyle(1, 0xf0f0f0, 1);
    pickerInteractLayer.beginFill(0x0000ff, 0.01);
    pickerInteractLayer.drawRect(0, 0, pickerAreaW, pickerAreaH);
    pickerInteractLayer.endFill();
  }

  protected showCurrentCell(info: string) {
    if (!this.mapInterectLayer || !this.screenRect) return;
    const mapAreaW = this.screenRect.width;
    const mapAreaH = this.screenRect.height * this.mapHeightRatio;
    // update text and position
    if (this.cellInfoText) {
      this.cellInfoText.x = mapAreaW - 80;
      this.cellInfoText.y = mapAreaH - 20;
      this.cellInfoText.text = info;
      return;
    }
    const style = new PIXI.TextStyle({
      dropShadow: true,
      dropShadowBlur: 1,
      dropShadowColor: '#ffffff',
      dropShadowDistance: 1,
      fill: ['#000000'],
      fontSize: 12,
    });
    this.cellInfoText = new PIXI.Text(info, style);
    this.cellInfoText.x = mapAreaW - 80;
    this.cellInfoText.y = mapAreaH - 20;
    this.mapInterectLayer.addChild(this.cellInfoText);
  }

  protected moveCellInfo() {
    if (!this.screenRect) return;
    const mapAreaW = this.screenRect.width;
    const mapAreaH = this.screenRect.height * this.mapHeightRatio;
    if (!this.cellInfoText) return;
    this.cellInfoText.x = mapAreaW - 80;
    this.cellInfoText.y = mapAreaH - 20;
  }

  /**
   * starting point of a game map
   *
   * @param mapWidth hori tiles for game map
   * @param mapHeight verti tiles for game map
   * @param tileWidth  each tile width in pixel
   * @param tileHeight each tile height in pixel
   */
  protected setGameDimension(
    mapWidth: number,
    mapHeight: number,
    tileWidth: number,
    tileHeight: number
  ) {
    this.gameHoriTiles = mapWidth;
    this.gameVertTiles = mapHeight;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    // cleanup
    this.gameMapLayersInfo.length = 0;
    // empty grid to hold texture ids
    const grid = this.makeEmptyMapLayerGrid(mapWidth, mapHeight);
    // trying to merge old layer
    this.mergeLayerTexturesFromSession(grid);
    // build one layer data as default one
    const layer: GameTilesLayer = {
      id: 1,
      width: mapWidth,
      height: mapHeight,
      grid,
    };
    this.gameMapLayersInfo.push(layer);
  }

  protected getGridFullSize() {
    const fullWidth = this.gameHoriTiles * this.tileWidth;
    const fullHeight = this.gameVertTiles * this.tileHeight;
    return { fullWidth, fullHeight };
  }

  /**
   * Redraw tile grid, after `setGameDimension`
   */
  protected drawMapGrid() {
    // console.log('>>> draw grid ...');
    // const stageRect = this.screenRect as Rectangle;
    const robot = this.mapDrawLayer as Graphics;
    robot.clear(); // cleanup before each draw

    const x0 = this.mapMarginX;
    const y0 = this.mapMarginY;
    const gridWidth = this.gameHoriTiles * this.tileWidth * this.mapScale;
    const gridHeight = this.gameVertTiles * this.tileHeight * this.mapScale;
    // frame
    const leftTopX = x0;
    const leftTopY = y0;
    const rightTopX = x0 + gridWidth;
    const rightTopY = y0;
    const leftBottomX = x0;
    const leftBottomY = y0 + gridHeight;
    const rightBottomX = x0 + gridWidth;
    const rightBottomY = y0 + gridHeight;

    const screenRect = this.screenRect as PIXI.Rectangle;
    const mapAreaW = screenRect.width;
    const mapAreaH = screenRect.height * this.mapHeightRatio;
    const cellSize = 16;
    const rowNumOfDots = Math.ceil(mapAreaH / cellSize) - 2;
    const colNumOfDots = Math.ceil(mapAreaW / cellSize);
    // draw pixel dots grid
    for (let i = 1; i < rowNumOfDots; i += 1) {
      for (let j = 1; j < colNumOfDots; j += 1) {
        robot.moveTo(j * cellSize, i * cellSize);
        robot.lineStyle(1, 0x333333, 1);
        robot.lineTo(j * cellSize + 1, i * cellSize + 1);
        robot.lineStyle(1, 0xffffff, 1);
        robot.lineTo(j * cellSize + 2, i * cellSize + 2);
      }
    }

    // draw out side frame
    robot.lineStyle(1, 0x333333, 1);
    robot.moveTo(leftTopX, leftTopY);
    robot.lineTo(rightTopX, rightTopY);
    robot.lineTo(rightBottomX, rightBottomY);
    robot.lineTo(leftBottomX, leftBottomY);
    robot.lineTo(leftTopX, leftTopY);

    // change dash line
    robot.lineStyle(1, 0x888888, 1);
    // horizontal dash lines
    for (let i = 1; i < this.gameVertTiles; i += 1) {
      const y1 = y0 + i * this.tileHeight * this.mapScale;
      robot.moveTo(x0, y1); // start point of drawing
      robot.lineTo(
        x0 + this.gameHoriTiles * this.tileWidth * this.mapScale,
        y1
      );
    }
    // vertical dash lines
    for (let j = 1; j < this.gameHoriTiles; j += 1) {
      const x1 = x0 + j * this.tileWidth * this.mapScale;
      robot.moveTo(x1, y0); // start point of drawing
      robot.lineTo(
        x1,
        y0 + this.gameVertTiles * this.tileHeight * this.mapScale
      );
    }
    // fill grid cells
    for (let i = 0; i < this.gameVertTiles; i += 1) {
      for (let j = 0; j < this.gameHoriTiles; j += 1) {
        const tw = this.tileWidth * this.mapScale;
        const th = this.tileHeight * this.mapScale;
        const x1 = x0 + j * tw;
        const y1 = y0 + i * th;
        robot.beginFill(0xd5e4f3, 1); // gray: 0xd4d4d8, light green: 0xd3d7d4
        robot.drawRect(x1, y1, tw, th);
      }
    }
  }

  protected drawTilePickerBackground(
    background: PIXI.Graphics,
    tw: number,
    th: number,
    gap = 1
  ) {
    if (!this.tiles) return;
    // black background
    const mapAreaW = this.screenRect?.width as number;
    const mapAreaH = (this.screenRect?.height as number) * 0.3;
    background.clear();
    background.beginFill(0x000000);
    background.drawRect(0, 0, mapAreaW, mapAreaH);
    background.endFill();
    // draw tile background
    for (let i = 0; i < this.tiles.length; i += 1) {
      const row = this.tiles[i];
      for (let j = 0; j < row.length; j += 1) {
        const xPos = j * (tw + gap) + this.tilesStartX;
        const yPos = i * (th + gap) + this.tilesStartY;
        background.beginFill(0xffffff, 0.8);
        background.drawRect(xPos, yPos, tw, th);
        background.endFill();
      }
    }
  }

  /**
   * FIXME: redraw picker grid...with newly created `tiles`
   * 2ND PLACE TO reset `tiles`
   *
   * @param selectedImage
   * @returns
   */
  protected reDrawTilePicker(selectedImage: string) {
    // console.log(`redraw tile picker: ${selectedImage}`);
    // *** RESET `tiles` ***
    const tempTiles = resetCachedTextures(
      this.tileWidth,
      this.tileHeight,
      selectedImage
    );
    // only in available to reset!
    if (tempTiles) {
      this.tiles = tempTiles;
    }
    if (!this.tiles) return;
    // redrawing...
    const tw = this.tileWidth * this.tileScale;
    const th = this.tileHeight * this.tileScale;
    const robot = this.pickerTileMap as PIXI.Graphics;
    robot.removeChildren(); // cleanup before each draw
    this.drawTilePickerBackground(robot, tw, th);
    this.layoutTileGrid(tw, th, this.tiles);
  }

  // put tiles
  protected layoutTileGrid(tw: number, th: number, tiles: PIXI.Texture[][]) {
    const robot = this.pickerTileMap as PIXI.Graphics;
    const gap = 1;
    for (let i = 0; i < tiles.length; i += 1) {
      const row = tiles[i];
      for (let j = 0; j < row.length; j += 1) {
        const xPos = j * (tw + gap) + this.tilesStartX;
        const yPos = i * (th + gap) + this.tilesStartY;
        const texture = tiles[i][j];
        const tile = new Sprite(texture);
        tile.x = xPos;
        tile.y = yPos;
        tile.width = tw;
        tile.height = th;
        robot.addChild(tile);
      }
    }
  }

  protected clearTileSelection() {
    const hoverTileLayer = this.selectedTileLayer as PIXI.Graphics;
    hoverTileLayer.clear();
    this.lastSelectedRectInPicker = PIXI.Rectangle.EMPTY;
  }

  /**
   * draw hover rect and selected rect
   * @param hitRect
   */
  protected drawTilePickerHoverRects(hitRect: PIXI.Rectangle) {
    const hoverTileLayer = this.selectedTileLayer as PIXI.Graphics;
    if (!rectEquals(hitRect, this.lastSelectedRectInPicker)) {
      hoverTileLayer.clear();
      hoverTileLayer.beginFill(0x0000ff, 0.2);
      hoverTileLayer.drawRect(
        hitRect.x,
        hitRect.y,
        hitRect.width,
        hitRect.height
      );
      hoverTileLayer.endFill();
    }
    // draw the previously selected tile
    const selectedTile = this.lastSelectedRectInPicker;
    if (!rectEquals(selectedTile, PIXI.Rectangle.EMPTY)) {
      hoverTileLayer.beginFill(0x0000ff, 0.5);
      hoverTileLayer.drawRect(
        selectedTile.x,
        selectedTile.y,
        selectedTile.width,
        selectedTile.height
      );
      hoverTileLayer.endFill();
    }
  }

  protected paintTileOnGameMap(
    hitRect: PIXI.Rectangle,
    grid: PIXI.Rectangle[][]
  ) {
    // get texture and paint to this rect
    const [x, y] = this.findCoordinateFromTileGrid(hitRect, grid);
    const isExisting = this.paintedTilesCache.has(`${x}_${y}`);
    if (isExisting) return console.warn('repeated paint!');

    const texture = this.getSelectedTexture();
    // and translate, scale...
    if (!texture) return;

    this.paintOneTextureBy(y, x, hitRect, texture);
    // record texture id into grid array
    const textureId = this.getSelectedTextureId();
    this.savePaintedTileFor(1, x, y, textureId);
  }

  protected paintOneTextureBy(
    row: number,
    column: number,
    cell: PIXI.Rectangle,
    texture: PIXI.Texture
  ) {
    if (!this.paintedTileMap) return;

    const tile = new Sprite(texture);
    tile.x = cell.x;
    tile.y = cell.y;
    tile.width = cell.width;
    tile.height = cell.height;
    const key = `${column}_${row}`;
    this.paintedTileMap.addChild(tile);
    this.paintedTilesCache.set(key, tile);
  }

  /**
   * repaint texture to map grid
   * @param texture
   * @param rowIndex
   * @param columnIndex
   */
  protected paintTextureTo(
    texture: PIXI.Texture,
    rowIndex: number,
    columnIndex: number
  ) {
    const x0 = this.mapMarginX;
    const y0 = this.mapMarginY;
    const tw = this.tileWidth * this.mapScale;
    const th = this.tileHeight * this.mapScale;
    const x1 = x0 + columnIndex * tw;
    const y1 = y0 + rowIndex * th;
    const cell = new PIXI.Rectangle(x1, y1, tw, th);
    this.paintOneTextureBy(rowIndex, columnIndex, cell, texture);
  }

  protected savePaintedTileFor(
    layerId: number,
    columnIndex: number,
    rowIndex: number,
    tileIndex: number
  ) {
    const layer = this.gameMapLayersInfo.find((l) => l.id === layerId);
    if (!layer) return console.warn('No layer found!');
    // save texuture id to grid
    layer.grid[rowIndex][columnIndex] = tileIndex;
    // save to session
    setDrawingSession({
      layerPainted: true,
      rowSize: layer.grid.length,
      columnSize: layer.grid[0].length,
      [`layer_${layerId}`]: this.flattenGrid(layer.grid),
    });
  }

  /**
   * erase tile from current rectangle
   *
   * @param hitRect
   * @param grid
   */
  protected eraseTileFromGameMap(
    hitRect: PIXI.Rectangle,
    grid: PIXI.Rectangle[][]
  ) {
    const [x, y] = this.findCoordinateFromTileGrid(hitRect, grid);
    const isExisting = this.paintedTilesCache.has(`${x}_${y}`);
    if (!isExisting) return; // no tile painted

    const key = `${x}_${y}`;
    const tile = this.paintedTilesCache.get(key) as Sprite;
    this.paintedTileMap?.removeChild(tile);
    this.paintedTilesCache.delete(key);
  }

  protected eraseAllTileFromGameMap() {
    this.paintedTilesCache.clear();
    this.paintedTileMap?.removeChildren();
  }

  protected paintHiligherOnGameMap(
    hitRect: PIXI.Rectangle,
    isTranslate?: boolean
  ) {
    if (!this.hoveredMapLayer) return;
    if (isTranslate) return;

    // clean previous sprite first
    this.cleanupHoveredTile();
    // draw highlighter
    const { x, y, width, height } = hitRect;
    // draw a green rectangle
    this.hoveredMapLayer.beginFill(0x00ff00, 0.8);
    this.hoveredMapLayer.drawRect(x, y, width, height);
    this.hoveredMapLayer.endFill();
    // check texture in use
    const texture = this.getSelectedTexture();
    if (!texture) return;
    // put new highlighter...
    const tile = new Sprite(texture);
    tile.x = x;
    tile.y = y;
    tile.width = width;
    tile.height = height;
    tile.alpha = 0.6;
    this.hoveredMapLayer.addChild(tile);
  }

  protected cleanupHoveredTile() {
    if (!this.hoveredMapLayer) return;
    this.hoveredMapLayer.clear();
    if (!this.hoveredMapLayer.children.length) return;
    this.hoveredMapLayer.removeChildAt(0);
  }

  protected paintEraserOnGameMap(hitRect: PIXI.Rectangle) {
    if (!this.hoveredMapLayer) return;
    const { x, y, width, height } = hitRect;
    this.hoveredMapLayer.clear();
    this.hoveredMapLayer.beginFill(0xffffff);
    this.hoveredMapLayer.drawRect(x, y, width, height);
    this.hoveredMapLayer.endFill();
  }

  protected scaleTileMap() {
    const grid = this.buildTileGridInMap();
    this.paintedTilesCache.forEach((tile, coordinate) => {
      const [x, y] = coordinate.split('_');
      const rect = grid[+y][+x];
      tile.x = rect.x;
      tile.y = rect.y;
      tile.width = rect.width;
      tile.height = rect.height;
    });
  }

  /**
   * resize tiles and redraw background
   * sprite position decided by `tw` and `th`
   */
  protected scaleTilePicker(tw: number, th: number) {
    if (!this.tiles) return;

    // ==> Step1: scale all the tiles
    const robot = this.pickerTileMap as PIXI.Graphics;
    robot.children.forEach((node, index) => {
      // if (index === 0) return;
      node.scale.set(this.tileScale, this.tileScale);
    });
    // ==> step2: move tiles to the right position
    const gap = 1;
    // row loop
    for (let i = 0; i < this.tiles.length; i += 1) {
      const row = this.tiles[i];
      // column loop
      for (let j = 0; j < row.length; j += 1) {
        const xPos = j * (tw + gap) + this.tilesStartX;
        const yPos = i * (th + gap) + this.tilesStartY;
        const tileIndex = i * row.length + j;
        const tileSprite = robot.getChildAt(tileIndex);
        tileSprite.x = xPos;
        tileSprite.y = yPos;
      }
    }
    // step3: redraw background
    // const background = robot.getChildAt(0) as PIXI.Graphics;
    this.drawTilePickerBackground(robot, tw, th);
  }

  /**
   * step4: redraw selected tile
   */
  protected scaleSelectedTileInPicker(tw: number, th: number) {
    if (!this.lastSelectedTilePosition) return;
    const gap = 1;
    const { x, y } = this.lastSelectedTilePosition;
    const xPos = x * (tw + gap) + this.tilesStartX;
    const yPos = y * (th + gap) + this.tilesStartY;
    // save it to latest position
    this.lastSelectedRectInPicker = new PIXI.Rectangle(xPos, yPos, tw, th);
    // visualize
    const hoverTileLayer = this.selectedTileLayer as PIXI.Graphics;
    hoverTileLayer.clear();
    hoverTileLayer.beginFill(0x0000ff, 0.5);
    hoverTileLayer.drawRect(xPos, yPos, tw, th);
    hoverTileLayer.endFill();
  }

  /**
   * move tiles no need to consider scale operation
   * @param diffX
   * @param diffY
   * @param tw
   * @param th
   * @returns
   */
  protected translateTilePicker(
    diffX: number,
    diffY: number,
    tw: number,
    th: number
  ) {
    if (!this.tiles) return;

    // move tiles
    const robot = this.pickerTileMap as PIXI.Graphics;
    robot.children.forEach((node, index) => {
      node.x += diffX;
      node.y += diffY;
    });
    // clear before redraw
    this.drawTilePickerBackground(robot, tw, th);
  }

  protected translateTileMap(diffX: number, diffY: number) {
    const tiles = (this.paintedTileMap as PIXI.Container).children;
    tiles.forEach((tile) => {
      tile.x += diffX;
      tile.y += diffY;
    });
  }

  protected translateSelectedTileInPicker(diffX: number, diffY: number) {
    const isEmptyRect = this.checkIsEmptyRect(this.lastSelectedRectInPicker);
    if (isEmptyRect) return;
    const { x, y, width, height } = this.lastSelectedRectInPicker;
    // save it to latest position
    this.lastSelectedRectInPicker = new PIXI.Rectangle(
      x + diffX,
      y + diffY,
      width,
      height
    );
    // visualize
    const hoverTileLayer = this.selectedTileLayer as PIXI.Graphics;
    hoverTileLayer.clear();
    hoverTileLayer.beginFill(0x0000ff, 0.5);
    hoverTileLayer.drawRect(x + diffX, y + diffY, width, height);
    hoverTileLayer.endFill();
  }

  protected translateGameMap(diffX: number, diffY: number) {
    this.mapMarginX += diffX;
    this.mapMarginY += diffY;
    // refresh grid
    this.drawMapGrid();

    // translate tiles
    this.translateTileMap(diffX, diffY);

    const detail = {
      mapMarginX: this.mapMarginX,
      mapMarginY: this.mapMarginY,
    };
    this.saveMapDimension();
  }

  protected saveLastHitRectangle(hitRect: PIXI.Rectangle) {
    const isEmptyRect = this.checkIsEmptyRect(hitRect);
    if (isEmptyRect) return;
    this.lastSelectedRectInPicker = hitRect;
    const tilegrid = this.buildTileGridInPicker();
    const [x, y] = this.findCoordinateFromTileGrid(hitRect, tilegrid);
    this.lastSelectedTilePosition = new PIXI.Point(x, y);
  }

  protected buildTileGridInPicker(): PIXI.Rectangle[][] {
    if (!this.tiles) return [];

    const grid = [];
    const gap = 1;
    const tw = this.tileWidth * this.tileScale;
    const th = this.tileHeight * this.tileScale;

    // row loop
    for (let i = 0; i < this.tiles.length; i += 1) {
      const row = [];
      // column loop
      for (let j = 0; j < this.tiles[i].length; j += 1) {
        const xPos = j * (tw + gap) + this.tilesStartX;
        const yPos = i * (th + gap) + this.tilesStartY;
        const rect = new PIXI.Rectangle(xPos, yPos, tw, th);
        row.push(rect);
      }
      grid.push(row);
    }

    return grid;
  }

  protected buildTileGridInMap(): PIXI.Rectangle[][] {
    const x0 = this.mapMarginX;
    const y0 = this.mapMarginY;
    const grid = [];
    for (let i = 0; i < this.gameVertTiles; i += 1) {
      const row = [];
      for (let j = 0; j < this.gameHoriTiles; j += 1) {
        const tw = this.tileWidth * this.mapScale;
        const th = this.tileHeight * this.mapScale;
        const x1 = x0 + j * tw;
        const y1 = y0 + i * th;
        const rect = new PIXI.Rectangle(x1, y1, tw, th);
        row.push(rect);
      }
      grid.push(row);
    }
    return grid;
  }

  protected getSelectedTexture() {
    if (this.checkIsEmptyRect(this.lastSelectedRectInPicker)) return null;
    const { x, y } = this.lastSelectedTilePosition as PIXI.Point;
    return this.findTextureByCoordinate(x, y);
  }

  /**
   * figure out texture from current tiles
   * @param index texture index start from 1
   * @returns texture resource
   */
  protected getTextureBy(index: number) {
    if (!index) return null; // possible 0
    if (!this.tiles) return null;

    const columns = this.tiles[0].length;
    const rowIndex = Math.floor((index - 1) / columns);
    const columnIndex = (index - 1) % columns;
    return this.tiles[rowIndex][columnIndex];
  }

  protected getTileGridDimension() {
    if (!this.tiles) return [0, 0];
    const columnSize = this.tiles[0].length;
    const rowSize = this.tiles.length;
    return [columnSize, rowSize];
  }

  protected getSelectedTextureId() {
    if (!this.tiles) return 0;
    if (this.checkIsEmptyRect(this.lastSelectedRectInPicker)) return 0;
    const { x, y } = this.lastSelectedTilePosition as PIXI.Point;
    const [column] = this.getTileGridDimension();
    return x + y * column + 1; // texture start from 1
  }

  protected findTextureByCoordinate(x: number, y: number) {
    if (!this.tiles) return null;
    return this.tiles[y][x];
  }

  protected findTextureIdFromLayer(layerId: number, x: number, y: number) {
    const layer = this.gameMapLayersInfo.find((l) => l.id === layerId);
    if (!layer) return 0;
    const { grid } = layer;
    const isValid = this.isRowCellExist;
    if (isValid(grid[y]) && isValid(grid[y][x])) {
      return grid[y][x];
    }
    return 0;
  }
}
