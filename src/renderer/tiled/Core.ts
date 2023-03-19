/**
 * Created at 2022/10/10
 */
import * as PIXI from 'pixi.js';
import { EventSystem } from '@pixi/events';
import { Graphics, Sprite } from 'pixi.js';
import { BaseEditor, rectEquals, EmptyRecT } from './Base';
import { GeneralObject } from '../config';
import { getSessionBy, clearPaintedTiles } from '../state/session';
import { SpriteX } from './SpriteX';
import { TileLegend } from '.';
import { getTileSheetBy, resetCachedTextures } from '../state/cache';

export type PatternFillCell = {
  /** hori index of map grid start from 1 */
  column: number;
  /** verti index oof map grid start from 1 */
  row: number;
  hitRect: PIXI.Rectangle;
  texture: PIXI.Texture | null;
  textureId: number;
  painted: boolean;
};

export type TexturePair = {
  id: number;
  texture: PIXI.Texture | null;
};

export class TiledCore extends BaseEditor {
  protected rootElement: HTMLElement;

  protected appWidth: number;
  protected appHeight: number;
  /** Horizontal tiles count */
  protected gameHoriTiles = 0;
  /** Vertical tiles count */
  protected gameVertTiles = 0;
  /** one tile width in pixel */
  protected tileWidth = 0;
  /** one tile height in pixel */
  protected tileHeight = 0;

  protected app: PIXI.Application | null; // hold the only instance of tile app here!
  protected screenRect: PIXI.Rectangle | null = null;

  protected mapContainer: PIXI.Container | null = null;
  protected paintedTileMap: PIXI.Container | null = null;
  protected mapDrawLayer: PIXI.Graphics | null = null;
  protected hoveredMapLayer: PIXI.Graphics | null = null;
  protected mapInterectLayer: PIXI.Graphics | null = null;

  protected cellInfoText: PIXI.Text | null = null;

  protected pickerContainer: PIXI.Container | null = null;
  protected pickerTileMap: PIXI.Graphics | null = null;
  protected pickerInteractLayer: PIXI.Graphics | null = null;
  protected selectedTileLayer: PIXI.Graphics | null = null;
  protected lastHoverRectInPicker: PIXI.Rectangle = PIXI.Rectangle.EMPTY;
  protected lastSelectedRectInPicker: PIXI.Rectangle = PIXI.Rectangle.EMPTY;
  protected lastSelectedTilePosition: PIXI.Point | null = null; // (x: columnIndex, y: rowIndex)
  protected startSelectedRectInPicker: PIXI.Rectangle = PIXI.Rectangle.EMPTY;
  protected startSelectedTilePosition: PIXI.Point | null = null; // (x: columnIndex, y: rowIndex)

  /** save predicted filling pattern  */
  protected patternFillCells: PatternFillCell[] = [];

  protected mapScale = 0.6;
  /** map start x */
  protected mapMarginX = 60;
  /** map start y */
  protected mapMarginY = 60;
  protected mapHeightRatio = 0.7;

  /** loaded tilesheet grid */
  /** initialized in `drawTilePicker` */
  protected tiles: PIXI.Texture[][] | null = null;
  /** tile picker start x */
  protected tilesStartX = 0;
  /** tile picker start y */
  protected tilesStartY = 0;
  protected tileScale = 1;

  /** ctrl key pressed flag */
  protected ctrlKeyPressed = false;

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
   * @param mapWidth horizontal tiles number
   * @param mapHeight vertical tiles number
   * @param tileWidth tile width in pixel
   * @param tileHeight tile height in pixel
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
  }

  /**
   * Paint layers and tile picker from cached tiles
   * @param session
   * @returns
   */
  paintMapLayer(session: GeneralObject) {
    // 1. check selectedImage from session
    const cachedSelectedImage = session.selectedImage as string;
    if (!cachedSelectedImage) return;
    // 2. trying to draw tile picker
    this.resetTileSize(cachedSelectedImage);
    // 3. check cache if have `layerPainted`
    // const isLayerPainted = session.layerPainted as boolean;
    // if (!isLayerPainted) return;
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
    if (!selectedImage) return; // no tilesheet in use
    // reset to initial position of tile grid after tileset loaded
    this.tilesStartX = 0;
    this.tilesStartY = 0;
    // console.log(`to redraw tile picker...`);
    this.reDrawTilePicker(selectedImage);
    this.clearTileSelection();
    clearPaintedTiles(1);
  }

  zoomIn() {
    if (this.mapScale > 2) return false;

    const { fullWidth, fullHeight } = this.getGridFullSize();
    this.mapMarginX -= fullWidth * 0.05;
    this.mapMarginY -= fullHeight * 0.05;
    this.mapScale += 0.1;
    this.drawMapGrid();
    this.saveMapDimension();
    return true;
  }

  zoomOut() {
    if (this.mapScale < 0.3) return false;

    const { fullWidth, fullHeight } = this.getGridFullSize();
    this.mapMarginX += fullWidth * 0.05;
    this.mapMarginY += fullHeight * 0.05;
    this.mapScale -= 0.1;
    this.drawMapGrid();
    this.saveMapDimension();
    return true;
  }

  zoomToRealSize() {
    this.mapMarginX = 10;
    this.mapMarginY = 10;
    this.mapScale = 1;
    this.drawMapGrid();
    this.saveMapDimension();
  }

  setMapTiles(tiles: PIXI.Texture[][]) {
    this.tiles = tiles;
  }

  // *************************** end of public api *************************************

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
    // make container sortable by zIndex
    this.paintedTileMap.sortableChildren = true;
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
      this.cellInfoText.x = mapAreaW - 90;
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
    this.cellInfoText.x = mapAreaW - 90;
    this.cellInfoText.y = mapAreaH - 20;
    this.mapInterectLayer.addChild(this.cellInfoText);
  }

  /**
   * @deprecated
   */
  protected moveCellInfo() {
    if (!this.screenRect) return;
    const mapAreaW = this.screenRect.width;
    const mapAreaH = this.screenRect.height * this.mapHeightRatio;
    if (!this.cellInfoText) return;
    this.cellInfoText.x = mapAreaW - 90;
    this.cellInfoText.y = mapAreaH - 20;
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
    const colNumOfDots = Math.ceil(mapAreaW / cellSize) - 1;
    // draw pixel dots grid
    for (let i = 1; i < rowNumOfDots; i += 1) {
      for (let j = 1; j < colNumOfDots; j += 1) {
        robot.moveTo(j * cellSize, i * cellSize);
        robot.lineStyle(1, 0x111111, 1);
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
    const cache = getTileSheetBy(selectedImage);
    if (!cache) return console.warn('no textures cached!');
    // only in case of tile size changed, to reset cache
    if (cache.tw !== this.tileWidth || cache.th !== this.tileHeight) {
      console.log(`resplit the tilesheet!`);
      this.tiles = resetCachedTextures(
        this.tileWidth,
        this.tileHeight,
        selectedImage
      );
    } else {
      this.tiles = cache.textures;
      // console.log(`got tiles from cache!`);
    }
    // redrawing...
    const stw = this.tileWidth * this.tileScale;
    const sth = this.tileHeight * this.tileScale;
    const robot = this.pickerTileMap as PIXI.Graphics;
    robot.removeChildren(); // cleanup before each draw
    this.drawTilePickerBackground(robot, stw, sth);
    if (!this.tiles) return;
    this.layoutTileGrid(stw, sth, this.tiles);
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

  /**
   * clear selected tile
   */
  protected clearTileSelection() {
    const hoverTileLayer = this.selectedTileLayer as PIXI.Graphics;
    hoverTileLayer.clear();
    this.lastSelectedRectInPicker = PIXI.Rectangle.EMPTY;
  }

  /**
   * In `Batch` selection mode by hold `CMD/CTRL` key:
   * Keep the first touched cell, and point!
   * @param hitRect
   * @returns
   */
  protected saveStartHitRectangle(hitRect: PIXI.Rectangle) {
    const isEmptyRect = this.checkIsEmptyRect(hitRect);
    if (isEmptyRect) return;
    this.startSelectedRectInPicker = hitRect;
    const tilegrid = this.buildTileGridInPicker();
    const [x, y] = this.findCoordinateFromTileGrid(hitRect, tilegrid);
    this.startSelectedTilePosition = new PIXI.Point(x - 1, y - 1);
  }

  /**
   * Kepp the current selected rect, and point!
   * @param hitRect
   * @returns
   */
  protected saveLastHitRectangle(hitRect: PIXI.Rectangle) {
    const isEmptyRect = this.checkIsEmptyRect(hitRect);
    if (isEmptyRect) return;
    this.lastSelectedRectInPicker = hitRect;
    const tilegrid = this.buildTileGridInPicker();
    const [x, y] = this.findCoordinateFromTileGrid(hitRect, tilegrid);
    this.lastSelectedTilePosition = new PIXI.Point(x - 1, y - 1);
  }

  protected isPatternFilling() {
    const [w, h] = this.getTilesPatternSize();
    if (w > 1 || h > 1) return true;
    return false;
  }

  protected isInsidePredictions(
    hitRect: PIXI.Rectangle,
    predictions: PatternFillCell[]
  ) {
    return !!predictions.find((p) => rectEquals(hitRect, p.hitRect));
  }

  /**
   * Figiure out list of cells for a pattern filling on map
   * @param startRect hit rectangle
   * @param grid hit map grid
   * @returns list of cell to fill
   */
  protected predictPatternFillCells(
    startRect: PIXI.Rectangle,
    grid: PIXI.Rectangle[][]
  ): PatternFillCell[] {
    const textures = this.getSelectedTextures();
    const [w, h] = this.getTilesPatternSize();
    const cells: PatternFillCell[] = [];
    const [col, row] = this.findPositionFromMapGrid(startRect, grid);
    for (let y = row; y < row + h; y += 1) {
      for (let x = col; x < col + w; x += 1) {
        const cell = this.findRectangleFromGrid(x, y, grid);
        if (!rectEquals(cell, EmptyRecT)) {
          cells.push({
            hitRect: cell,
            column: x + 1,
            row: y + 1,
            texture: null, // leave this to next `map` loop
            textureId: 0, // leave this to next `map` loop
            painted: false,
          });
        }
      }
    }
    return cells.map((c, i) => ({
      ...c,
      textureId: textures[i].id,
      texture: textures[i].texture,
    }));
  }

  /**
   * Get pattern size to predict the cells to use in map
   * @returns pattern fill rectangle size
   */
  protected getTilesPatternSize() {
    const startPt = this.startSelectedTilePosition;
    const endPt = this.lastSelectedTilePosition;
    if (!startPt || !endPt) return [0, 0];

    const width = Math.abs(startPt.x - endPt.x);
    const height = Math.abs(startPt.y - endPt.y);
    return [width + 1, height + 1];
  }

  /**
   * draw hover rect and selected rect
   * @param hitRect
   */
  protected drawTilePickerHoverRects(hitRect: PIXI.Rectangle) {
    if (this.ctrlKeyPressed) return; // ignore below while in dragging selection
    // draw moving mouse indicator
    const hoverTileLayer = this.selectedTileLayer as PIXI.Graphics;
    hoverTileLayer.clear();
    hoverTileLayer.beginFill(0x0000ff, 0.2);
    hoverTileLayer.drawRect(
      hitRect.x,
      hitRect.y,
      hitRect.width,
      hitRect.height
    );
    hoverTileLayer.endFill();

    const startPt = this.startSelectedTilePosition;
    const endPt = this.lastSelectedTilePosition;
    // draw multiple selection
    if (endPt && startPt && !endPt.equals(startPt)) {
      this.drawSelectionsInPickerBy(
        startPt.x + 1,
        startPt.y + 1,
        endPt.x + 1,
        endPt.y + 1,
        false
      );
      return;
    }
    // draw selected tile highlighter
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

  /**
   * Drawing multple cell to indicat selected tiles, and save the selections.
   *
   * @param startCol column index after pointer pressed, start with 1
   * @param startRow row index after pointer pressed, start with 1
   * @param endCol column index of last pointer, start with 1
   * @param endRow row index of last pointer, start with 1
   * @param clearFirst if need clear first, `true` by default
   */
  protected drawSelectionsInPickerBy(
    startCol: number,
    startRow: number,
    endCol: number,
    endRow: number,
    clearFirst = true
  ) {
    if (startCol === endCol && startRow === endRow) return;
    // console.log(`${startCol}/${startRow}, ${endCol}/${endRow}`);
    // prepare to draw
    const hoverTileLayer = this.selectedTileLayer as PIXI.Graphics;
    clearFirst && hoverTileLayer.clear();
    // figure out the start & end
    const minCol = startCol < endCol ? startCol : endCol;
    const maxCol = endCol > startCol ? endCol : startCol;
    const minRow = startRow < endRow ? startRow : endRow;
    const maxRow = endRow > startRow ? endRow : startRow;
    const grid = this.buildTileGridInPicker();
    for (let y = minRow - 1; y < maxRow; y += 1) {
      for (let x = minCol - 1; x < maxCol; x += 1) {
        // console.log(`to find cell: ${x}/${y}`);
        if (x < 0 || y < 0) return;
        const cell = this.findRectangleFromGrid(x, y, grid);
        // console.log(cell);
        hoverTileLayer.beginFill(0x0000ff, 0.5);
        hoverTileLayer.drawRect(cell.x, cell.y, cell.width, cell.height);
        hoverTileLayer.endFill();
      }
    }
  }

  protected fillTileOnGameMap(layerId: number) {
    const texture = this.getSelectedTexture();
    if (!texture) return [];
    const sprites = [];
    for (let x = 0; x < this.gameHoriTiles; x += 1) {
      for (let j = 0; j < this.gameVertTiles; j += 1) {
        const tile = this.paintTextureTo(texture, j, x, layerId);
        tile && sprites.push(tile);
      }
    }
    return sprites;
  }

  /**
   * Create SriteX by map grid parameter
   * @param layerId which layer to use
   * @param xIndex column position, start from 0
   * @param yIndex row position, start from 0
   * @param tileId texture id of current tilesheet
   */
  protected putTileOnGameMap(
    layerId: number,
    xIndex: number,
    yIndex: number,
    tileId: number
  ) {
    if (!tileId) return; // 0 is invalid tile id!
    const texture = this.getTextureBy(tileId);
    if (!texture) {
      // console.warn(`!!! no texture found!`);
      return;
    }
    // FIXME: wrongly put yIndex to the xIndex position!
    // @2023/02/22
    return this.paintTextureTo(texture, yIndex, xIndex, layerId);
  }

  /**
   * paint texture to a safe layer
   *
   * @param hitRect
   * @param grid
   * @param layerId current selected layer id
   * @returns
   */
  protected paintTileOnGameMap(
    hitRect: PIXI.Rectangle,
    grid: PIXI.Rectangle[][],
    layerId: number
  ) {
    // get texture and paint to this rect
    const [x, y] = this.findCoordinateFromTileGrid(hitRect, grid);

    const texture = this.getSelectedTexture();
    // and translate, scale...
    if (!texture)
      return {
        layerId,
        columnIndex: x,
        rowIndex: y,
        textureId: 0,
      };

    // check which layer is selected
    const tile = this.paintOneTextureBy(layerId, y, x, hitRect, texture);
    // record texture id into grid array
    const textureId = this.getSelectedTextureId();

    return {
      columnIndex: x,
      rowIndex: y,
      layerId,
      textureId,
      tile,
    };
  }

  /**
   * Create SpriteX into the canvas
   * @param layerId
   * @param row start with 1
   * @param column start with 1
   * @param cell position to put the sprite
   * @param texture texture used for sprite
   * @returns
   */
  protected paintOneTextureBy(
    layerId: number,
    row: number,
    column: number,
    cell: PIXI.Rectangle,
    texture: PIXI.Texture
  ) {
    if (!this.paintedTileMap) {
      console.warn(`>> painting container does not exist!`);
      return;
    }
    const key = `${column}_${row}`;
    const tile = new SpriteX(texture, layerId);
    tile.setUniqueKey(key);
    tile.x = cell.x;
    tile.y = cell.y;
    tile.width = cell.width;
    tile.height = cell.height;
    this.paintedTileMap.addChild(tile);

    return tile;
  }

  /**
   * repaint texture to map grid
   * @param texture
   * @param yIndex vertical coordinate, start from 0
   * @param xIndex horizontal coordinate, start from 0
   */
  protected paintTextureTo(
    texture: PIXI.Texture,
    yIndex: number,
    xIndex: number,
    layerId: number
  ) {
    const x0 = this.mapMarginX;
    const y0 = this.mapMarginY;
    const tw = this.tileWidth * this.mapScale;
    const th = this.tileHeight * this.mapScale;
    const x1 = x0 + xIndex * tw;
    const y1 = y0 + yIndex * th;
    const cell = new PIXI.Rectangle(x1, y1, tw, th);
    const column = xIndex + 1;
    const row = yIndex + 1;
    return this.paintOneTextureBy(layerId, row, column, cell, texture);
  }

  /**
   * erase tile from current container
   */
  protected eraseTileFromGameMap(tile: Sprite) {
    this.paintedTileMap?.removeChild(tile);
  }

  /**
   * remove all tiles from displaying
   */
  protected cleanupTiles() {
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
    this.hoveredMapLayer.removeChildren();
  }

  /**
   * draw tiles horizontally at the bottom left corner
   * @param textures
   */
  protected revealTilesUnderMouse(textures: TileLegend[]) {
    if (!this.screenRect) return;
    const mapAreaH = this.screenRect.height * this.mapHeightRatio;
    textures.forEach((tl, index) => {
      if (!this.hoveredMapLayer) return;
      // draw rect
      const tileXPos = 8 + index * 21;
      const tileYPos = mapAreaH - 24;
      const bgColor = tl.active ? 0x5ec169 : 0xeeeeee;
      this.hoveredMapLayer.beginFill(bgColor, 1);
      this.hoveredMapLayer.drawRect(tileXPos, tileYPos, 20, 20);
      this.hoveredMapLayer.endFill();
      // draw tile legend
      const texture = this.getTextureBy(tl.textureId);
      if (!texture) return;
      const tile = new Sprite(texture);
      tile.x = tileXPos;
      tile.y = tileYPos;
      tile.width = 20;
      tile.height = 20;
      this.hoveredMapLayer.addChild(tile);
    });
  }

  protected paintEraserOnGameMap(hitRect: PIXI.Rectangle) {
    if (!this.hoveredMapLayer) return;
    const { x, y, width, height } = hitRect;
    this.hoveredMapLayer.clear();
    this.hoveredMapLayer.beginFill(0xffffff);
    this.hoveredMapLayer.drawRect(x, y, width, height);
    this.hoveredMapLayer.endFill();
  }

  /**
   * resize tiles and redraw background
   * sprite position decided by `tw` and `th`
   */
  protected scaleTilePicker(tw: number, th: number) {
    if (!this.tiles) return;

    // ==> Step1: scale all the tiles
    const robot = this.pickerTileMap as PIXI.Graphics;
    robot.children.forEach((node, _) => {
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

  // TODO: update game map object ...
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

    this.saveMapDimension();
  }

  /**
   * Picker grid without considering y axis offset
   * @returns
   */
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

  protected getSelectedTexture(hitRect?: PIXI.Rectangle) {
    if (this.checkIsEmptyRect(this.lastSelectedRectInPicker)) return null;
    const { x, y } = this.lastSelectedTilePosition as PIXI.Point;
    // consider pattern filling mode
    if (this.isPatternFilling() && hitRect) {
      const predictionOnHit = this.patternFillCells.find((cell) =>
        rectEquals(cell.hitRect, hitRect)
      );
      return predictionOnHit ? predictionOnHit.texture : null;
    }
    return this.findTextureByCoordinate(x, y);
  }

  /**
   * GET textures list from selected position.
   */
  protected getSelectedTextures(): TexturePair[] {
    const startPt = this.startSelectedTilePosition;
    const endPt = this.lastSelectedTilePosition;
    if (!startPt || !endPt) return [];

    const minX = startPt.x < endPt.x ? startPt.x : endPt.x;
    const maxX = endPt.x > startPt.x ? endPt.x : startPt.x;
    const minY = startPt.y < endPt.y ? startPt.y : endPt.y;
    const maxY = endPt.y > startPt.y ? endPt.y : startPt.y;

    const tileMatrix: TexturePair[] = [];
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const id = this.getTextureIdByCoordinate(x, y);
        const texture = this.findTextureByCoordinate(x, y);
        tileMatrix.push({
          id,
          texture,
        });
      }
    }
    return tileMatrix;
  }

  /**
   * figure out texture from current tiles
   *
   * @param textureId start from 1
   * @returns texture resource
   */
  protected getTextureBy(textureId: number) {
    if (!textureId) return null; // possible 0
    if (!this.tiles) {
      console.warn(`### no tiles grid initialized!!`);
      return null;
    }
    console.log(`find texture: ${textureId}`);
    const columns = this.tiles[0].length;
    console.log(`tiles: ${this.tiles.length}/${columns}`);

    const rowIndex = Math.floor((textureId - 1) / columns);
    const columnIndex = (textureId - 1) % columns;
    console.log(`from ${rowIndex}/${columnIndex}`);

    const rowTiles = this.tiles[rowIndex];
    if (!rowTiles) {
      console.warn(`# tile in row ${rowIndex} undefined!`);
      return;
    }
    if (!rowTiles[columnIndex]) {
      console.warn(`# tile in column ${columnIndex} undefined!`);
      return;
    }
    return rowTiles[columnIndex];
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

  protected getTextureIdByCoordinate(x: number, y: number) {
    if (!this.tiles) return 0;
    const columnSize = this.tiles[0].length;
    return x + y * columnSize + 1;
  }

  protected clearTilesFromMap(tiles: Sprite[]) {
    tiles.forEach((tile) => this.paintedTileMap?.removeChild(tile));
  }
}
