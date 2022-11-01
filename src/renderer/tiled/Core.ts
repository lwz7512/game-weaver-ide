/**
 * Created at 2022/10/10
 */
import * as PIXI from 'pixi.js';
import { EventSystem, FederatedPointerEvent } from '@pixi/events';
import { Graphics, Rectangle, Sprite } from 'pixi.js';
import { BaseEditor, rectEquals } from './Base';
import { DrawingSession } from '../config';

type EventHandler = (event: Event) => void;

export class TiledCore extends BaseEditor {
  rootElement: HTMLElement;

  appWidth: number;
  appHeight: number;

  gameHoriTiles = 0; // horizontal tiles count
  gameVertTiles = 0; // vertical tiles count

  tileWidth = 0; // one tile width in pixel
  tileHeight = 0; // one tile height in pixel

  app: PIXI.Application | null; // hold the only instance of tile app here!
  screenRect: Rectangle | null = null;

  mapContainer: PIXI.Container | null = null;
  pickerContainer: PIXI.Container | null = null;

  mapDrawLayer: PIXI.Graphics | null = null;
  hoveredMapLayer: PIXI.Graphics | null = null;
  mapInterectLayer: PIXI.Graphics | null = null;
  lastHoverRectInMap: PIXI.Rectangle = PIXI.Rectangle.EMPTY;

  pickerTileMap: PIXI.Container | null = null;
  pickerInteractLayer: PIXI.Graphics | null = null;
  selectedTileLayer: PIXI.Graphics | null = null;
  lastHoverRectInPicker: PIXI.Rectangle = PIXI.Rectangle.EMPTY;
  lastSelectedRectInPicker: PIXI.Rectangle = PIXI.Rectangle.EMPTY;

  mapScale = 0.6;
  mapMarginX = 100;
  mapMarginY = 100;
  mapHeightRatio = 0.7;

  stagePressed = false;

  // loaded tilesheet grid
  tiles: PIXI.Texture[][] | null = null;
  tilesStartX = 0;
  tilesStartY = 0;
  tileScale = 1;

  onPointerDownStage: EventHandler = () => null;
  onPointerUpStage: EventHandler = () => null;
  onPointerMoveOnMap: EventHandler = () => null;
  onWheelMoveOnMap: EventHandler = () => null;
  onPointerMoveOnPicker: EventHandler = () => null;
  onWheelMoveOnPicker: EventHandler = () => null;
  onClickTilePicker: EventHandler = () => null;

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
      backgroundColor: 0xd4d4d8, // gray
      resolution: 1,
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
   * reset the game parameter befor `run`
   */
  resetSession(detail: DrawingSession) {
    if (detail.mapMarginX) {
      this.mapMarginX = detail.mapMarginX as number;
    }
    if (detail.mapMarginY) {
      this.mapMarginY = detail.mapMarginY as number;
    }
  }

  /**
   * Run the main functions for the tile tool
   */
  create(session?: DrawingSession) {
    if (session) this.resetSession(session);

    const safeApp = this.app as PIXI.Application;
    this.init(safeApp);
    this.listen(safeApp);
  }

  /**
   * setup editor needed two main sections:
   *
   * 1. Stage section to draw tiles by click and drag arbitrarily.
   * 2. Picker section to offer tile source grid to pickup.
   *
   */
  init(app: PIXI.Application) {
    // map container includes:
    // 1. mapDrawLayer
    // 2. hoveredMapLayer
    // 3. mapInterectLayer
    this.mapContainer = new PIXI.Container();
    app.stage.addChild(this.mapContainer);

    this.screenRect = app.renderer.screen;
    // tile grid at the top part
    const mapAreaW = this.screenRect.width;
    const mapAreaH = this.screenRect.height * this.mapHeightRatio;

    // draw grid, put sprites
    this.mapDrawLayer = new PIXI.Graphics();
    this.mapContainer.addChild(this.mapDrawLayer);
    const maskTop = new PIXI.Graphics();
    maskTop.beginFill(0xffffff);
    maskTop.drawRect(0, 0, mapAreaW + 1, mapAreaH + 1);
    maskTop.endFill();
    this.mapDrawLayer.mask = maskTop;

    // hold the hovered rectangle over cells
    this.hoveredMapLayer = new PIXI.Graphics();
    this.mapContainer.addChild(this.hoveredMapLayer);

    // add event listeners
    this.mapInterectLayer = new PIXI.Graphics();
    this.mapInterectLayer.interactive = true;
    this.mapContainer.addChild(this.mapInterectLayer);

    this.mapInterectLayer.lineStyle(1, 0xf0f0f0, 2);
    this.mapInterectLayer.beginFill(0x0000ff, 0.001);
    this.mapInterectLayer.drawRect(0, 0, mapAreaW, mapAreaH);
    this.mapInterectLayer.endFill();

    // picker container includes:
    // 1. pickerTileMap
    // 2. selectedTileLayer
    // 3. pickerInteractLayer
    this.pickerContainer = new PIXI.Container();
    this.pickerContainer.y = this.screenRect.height * this.mapHeightRatio;
    app.stage.addChild(this.pickerContainer);

    // tile picker at the bottom part
    // includes two parts:
    // 1. background graphics
    // 2. tiles sprites
    this.pickerTileMap = new PIXI.Container();
    // // move it to the bottom of map
    this.pickerContainer.addChild(this.pickerTileMap);
    const pickerAreaW = this.screenRect.width;
    const pickerAreaH = this.screenRect.height * 0.3;
    const maskBtm = new PIXI.Graphics();
    maskBtm.beginFill(0xffffff);
    // draw mask to the bottom of map
    maskBtm.drawRect(0, mapAreaH, pickerAreaW + 1, pickerAreaH);
    maskBtm.endFill();
    this.pickerTileMap.mask = maskBtm;

    // layer to indicate which tile is selected
    this.selectedTileLayer = new PIXI.Graphics();
    this.pickerContainer.addChild(this.selectedTileLayer);

    // add event listener
    this.pickerInteractLayer = new PIXI.Graphics();
    this.pickerInteractLayer.interactive = true;
    this.pickerContainer.addChild(this.pickerInteractLayer);
    this.pickerInteractLayer.lineStyle(1, 0xf0f0f0, 1);
    this.pickerInteractLayer.beginFill(0x0000ff, 0.01);
    this.pickerInteractLayer.drawRect(0, 0, pickerAreaW, pickerAreaH);
    this.pickerInteractLayer.endFill();
  }

  /**
   * add action to two main layers:
   * move, pointer down/up, click...
   * @param app
   */
  listen(app: PIXI.Application) {
    this.onPointerDownStage = (event: Event) => {
      this.stagePressed = true;
    };

    this.onPointerUpStage = (event: Event) => {
      this.stagePressed = false;
    };

    this.onPointerMoveOnMap = (event: Event) => {
      if (!this.stagePressed) return;

      const fdEvent = event as FederatedPointerEvent;
      // const currentX = fdEvent.globalX;
      const diffX = fdEvent.movementX * 0.6;
      const diffY = fdEvent.movementY * 0.6;

      this.mapMarginX += diffX;
      this.mapMarginY += diffY;
      // refresh grid
      this.drawMapGrid();

      const detail = {
        mapMarginX: this.mapMarginX,
        mapMarginY: this.mapMarginY,
      };
      // `useTiledEditor` handle this event
      this.dispatchEvent(new CustomEvent('session', { detail }));
    };

    this.onWheelMoveOnMap = (event: Event) => {
      const wheelEvt = event as WheelEvent;
      const scaleDiff = wheelEvt.deltaY * -0.01;
      this.mapScale += scaleDiff;
      // Restrict scale
      this.mapScale = Math.min(Math.max(0.2, this.mapScale), 2);
      // move to center
      const diffWidth = this.gameHoriTiles * this.tileWidth * scaleDiff * 0.5;
      const diffHeight = this.gameVertTiles * this.tileHeight * scaleDiff * 0.5;
      this.mapMarginX -= diffWidth;
      this.mapMarginY -= diffHeight;
      // limit position
      const { fullWidth, fullHeight } = this.getGridFullSize();
      this.mapMarginX = Math.min(
        Math.max(-fullWidth * 0.5, this.mapMarginX),
        fullWidth * 0.5
      );
      this.mapMarginY = Math.min(
        Math.max(-fullHeight * 0.5, this.mapMarginY),
        fullHeight * 0.5
      );

      this.drawMapGrid();
    };

    this.onPointerMoveOnPicker = (event: Event) => {
      const fdEvent = event as FederatedPointerEvent;
      // drawing the tile highlight rectangle in the `selectedTileLayer`
      const screenRect = this.screenRect as PIXI.Rectangle;
      const pickerYOffset = screenRect.height * this.mapHeightRatio;
      const currentX = fdEvent.globalX;
      const currentY = fdEvent.globalY - pickerYOffset;
      // figure out the tile coordinate ...
      const point = new PIXI.Point(currentX, currentY);
      const grid = this.buildTileGridInPicker();
      const hitRect = this.containInGrid(point, grid);
      if (!rectEquals(hitRect, this.lastHoverRectInPicker)) {
        window.requestAnimationFrame(() =>
          this.drawTilePickerHoverRects(hitRect)
        );
        this.lastHoverRectInPicker = hitRect;
      }

      if (!this.stagePressed) return;

      // move the total tiles
      const diffX = fdEvent.movementX * 0.6;
      const diffY = fdEvent.movementY * 0.6;
      const tw = this.tileWidth * this.tileScale;
      const th = this.tileHeight * this.tileScale;
      // save the latest position
      this.tilesStartX += diffX;
      this.tilesStartY += diffY;
      this.translateTilePicker(diffX, diffY, tw, th);
    };

    this.onWheelMoveOnPicker = (event: Event) => {
      const wheelEvt = event as WheelEvent;
      const scaleDiff = wheelEvt.deltaY * -0.01;
      this.tileScale += scaleDiff;
      // Restrict scale
      this.tileScale = Math.min(Math.max(0.5, this.tileScale), 1.5);
      const tw = this.tileWidth * this.tileScale;
      const th = this.tileHeight * this.tileScale;
      this.scaleTilePicker(tw, th);
    };

    // draw selected cell(border & fill) on background graphics...
    this.onClickTilePicker = (event: Event) => {
      const fdEvent = event as FederatedPointerEvent;
      const screenRect = this.screenRect as PIXI.Rectangle;
      const pickerYOffset = screenRect.height * this.mapHeightRatio;
      const pointerX = fdEvent.globalX;
      const pointerY = fdEvent.globalY - pickerYOffset;

      // draw selected tile
      const point = new PIXI.Point(pointerX, pointerY);
      const grid = this.buildTileGridInPicker();
      const hitRect = this.containInGrid(point, grid);
      this.drawTilePickerHoverRects(hitRect);
      this.lastSelectedRectInPicker = hitRect;
    };

    if (this.mapInterectLayer) {
      this.mapInterectLayer.addEventListener(
        'pointermove',
        this.onPointerMoveOnMap
      );
      this.mapInterectLayer.addEventListener('wheel', this.onWheelMoveOnMap);
    }

    if (this.pickerInteractLayer) {
      this.pickerInteractLayer.addEventListener(
        'pointermove',
        this.onPointerMoveOnPicker
      );
      this.pickerInteractLayer.addEventListener(
        'wheel',
        this.onWheelMoveOnPicker
      );
      this.pickerInteractLayer.addEventListener(
        'click',
        this.onClickTilePicker
      );
    }

    app.stage.interactive = true;
    // this.app.stage.hitArea = renderer.screen;
    app.stage.addEventListener('pointerdown', this.onPointerDownStage);
    app.stage.addEventListener('pointerup', this.onPointerUpStage);
    app.stage.addEventListener('pointerupoutside', this.onPointerUpStage);
  }

  /**
   * starting point of a game map
   *
   * @param mapWidth hori tiles for game map
   * @param mapHeight verti tiles for game map
   * @param tileWidth  each tile width in pixel
   * @param tileHeight each tile height in pixel
   */
  setGameDimension(
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

  getGridFullSize() {
    const fullWidth = this.gameHoriTiles * this.tileWidth;
    const fullHeight = this.gameVertTiles * this.tileHeight;
    return { fullWidth, fullHeight };
  }

  zoomIn() {
    if (this.mapScale > 2) return;

    const { fullWidth, fullHeight } = this.getGridFullSize();
    this.mapMarginX -= fullWidth * 0.05;
    this.mapMarginY -= fullHeight * 0.05;
    this.mapScale += 0.1;
    this.drawMapGrid();
  }

  zoomOut() {
    if (this.mapScale < 0.3) return;

    const { fullWidth, fullHeight } = this.getGridFullSize();
    this.mapMarginX += fullWidth * 0.05;
    this.mapMarginY += fullHeight * 0.05;
    this.mapScale -= 0.1;
    this.drawMapGrid();
  }

  /**
   * Redraw tile grid
   */
  drawMapGrid() {
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
    const rowNumOfDots = Math.ceil(mapAreaH / cellSize);
    const colNumOfDots = Math.ceil(mapAreaW / cellSize);
    // draw pixel dots grid
    for (let i = 1; i < rowNumOfDots; i += 1) {
      for (let j = 1; j < colNumOfDots; j += 1) {
        robot.moveTo(j * cellSize, i * cellSize);
        robot.lineStyle(1, 0x666666, 1);
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
        robot.beginFill(0xd3d7d4, 1); // gray: 0xd4d4d8
        robot.drawRect(x1, y1, tw, th);
      }
    }
  }

  /**
   * Drawing tiles matrix, gap use global settings
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

    const gap = 1;
    const robot = this.pickerTileMap as PIXI.Container;
    robot.removeChildren(); // cleanup before each draw
    const background = new PIXI.Graphics();
    robot.addChild(background);
    this.drawTilePickerBackground(background, tw, th);
    // put tiles
    for (let i = 0; i < tiles.length; i += 1) {
      const row = tiles[i];
      for (let j = 0; j < row.length; j += 1) {
        const xPos = j * (tw + gap);
        const yPos = i * (th + gap);
        const texture = tiles[i][j];
        const tile = new Sprite(texture);
        tile.x = xPos;
        tile.y = yPos;
        robot.addChild(tile);
      }
    }
  }

  drawTilePickerBackground(
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

  drawTilePickerHoverRects(hitRect: PIXI.Rectangle) {
    const hoverTileLayer = this.selectedTileLayer as PIXI.Graphics;
    if (!rectEquals(hitRect, this.lastSelectedRectInPicker)) {
      hoverTileLayer.clear();
      hoverTileLayer.beginFill(0x0000ff, 0.5);
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

  /**
   * resize tiles and redraw background
   * sprite position decided by `tw` and `th`
   */
  scaleTilePicker(tw: number, th: number) {
    if (!this.tiles) return;

    // ==> Step1: scale all the tiles
    const robot = this.pickerTileMap as PIXI.Container;
    robot.children.forEach((node, index) => {
      if (index === 0) return;
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
        const tileIndex = i * row.length + j + 1; // after background graphics
        const tileSprite = robot.getChildAt(tileIndex);
        tileSprite.x = xPos;
        tileSprite.y = yPos;
      }
    }
    // step3: redraw background
    const background = robot.getChildAt(0) as PIXI.Graphics;
    this.drawTilePickerBackground(background, tw, th);
  }

  /**
   * move tiles no need to consider scale operation
   * @param diffX
   * @param diffY
   * @param tw
   * @param th
   * @returns
   */
  translateTilePicker(diffX: number, diffY: number, tw: number, th: number) {
    if (!this.tiles) return;

    // move tiles
    const robot = this.pickerTileMap as PIXI.Container;
    robot.children.forEach((node, index) => {
      if (index === 0) return;
      node.x += diffX;
      node.y += diffY;
    });
    // clear before redraw
    const background = robot.getChildAt(0) as PIXI.Graphics;
    this.drawTilePickerBackground(background, tw, th);
  }

  containInGrid(pt: PIXI.Point, grid: PIXI.Rectangle[][]): PIXI.Rectangle {
    let result = PIXI.Rectangle.EMPTY;
    for (let i = 0; i < grid.length; i += 1) {
      const column = grid[i];
      for (let j = 0; j < column.length; j += 1) {
        const rect = column[j];
        const isInside = rect.contains(pt.x, pt.y);
        if (isInside) result = rect;
      }
    }
    return result;
  }

  buildTileGridInPicker(): PIXI.Rectangle[][] {
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

  buildTileGridInMap(): PIXI.Rectangle[][] {
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

  destroy() {
    if (this.app) {
      this.app.stage.removeEventListener(
        'pointerdown',
        this.onPointerDownStage
      );
      this.app.stage.removeEventListener('pointerup', this.onPointerUpStage);

      if (this.mapInterectLayer) {
        this.mapInterectLayer.removeEventListener(
          'pointermove',
          this.onPointerMoveOnMap
        );
        this.mapInterectLayer.removeEventListener(
          'wheel',
          this.onWheelMoveOnMap
        );
      }

      if (this.pickerInteractLayer) {
        this.pickerInteractLayer.removeEventListener(
          'pointermove',
          this.onPointerMoveOnPicker
        );
        this.pickerInteractLayer.removeEventListener(
          'wheel',
          this.onWheelMoveOnPicker
        );
        this.pickerInteractLayer.removeEventListener(
          'click',
          this.onClickTilePicker
        );
      }

      this.rootElement.removeChild(this.app.view);
      this.app = null;
    }
  } // end of destroy()
}
