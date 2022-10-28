/**
 * Created at 2022/10/10
 */
import * as PIXI from 'pixi.js';
import { EventSystem, FederatedPointerEvent } from '@pixi/events';
import { Graphics, Rectangle, Sprite } from 'pixi.js';
import { BaseEditor } from './Base';
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
  mapInterectLayer: PIXI.Graphics | null = null;

  pickerTileMap: PIXI.Container | null = null;
  pickerInteractLayer: PIXI.Graphics | null = null;

  mapScale = 0.6;
  mapMarginX = 100;
  mapMarginY = 100;

  stagePressed = false;

  onPointerDownStage: EventHandler = () => null;
  onPointerUpStage: EventHandler = () => null;
  onPointerMoveOnMap: EventHandler = () => null;
  onWheelMoveOnMap: EventHandler = () => null;

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
    this.mapContainer = new PIXI.Container();
    app.stage.addChild(this.mapContainer);

    this.screenRect = app.renderer.screen;
    // tile grid at the top part
    const mapAreaW = this.screenRect.width;
    const mapAreaH = this.screenRect.height * 0.7;

    this.mapDrawLayer = new PIXI.Graphics();
    this.mapContainer.addChild(this.mapDrawLayer);
    const maskTop = new PIXI.Graphics();
    maskTop.beginFill(0xffffff);
    maskTop.drawRect(0, 0, mapAreaW + 1, mapAreaH + 1);
    maskTop.endFill();
    this.mapDrawLayer.mask = maskTop;

    // add event listeners
    this.mapInterectLayer = new PIXI.Graphics();
    this.mapInterectLayer.interactive = true;
    this.mapContainer.addChild(this.mapInterectLayer);

    this.mapInterectLayer.lineStyle(1, 0xf0f0f0, 2);
    this.mapInterectLayer.beginFill(0x0000ff, 0.001);
    this.mapInterectLayer.drawRect(0, 0, mapAreaW, mapAreaH);
    this.mapInterectLayer.endFill();

    this.pickerContainer = new PIXI.Container();
    this.pickerContainer.y = this.screenRect.height * 0.7;
    app.stage.addChild(this.pickerContainer);

    // tile picker at the bottom part
    this.pickerTileMap = new PIXI.Container();
    // // move it to the bottom of map
    this.pickerContainer.addChild(this.pickerTileMap);
    const pickerAreaW = this.screenRect.width;
    const pickerAreaH = this.screenRect.height * 0.3;
    // FIXME: need mask?
    const maskBtm = new PIXI.Graphics();
    maskBtm.beginFill(0xffffff);
    // draw mask to the bottom of map
    maskBtm.drawRect(0, mapAreaH, pickerAreaW + 1, pickerAreaH);
    maskBtm.endFill();
    this.pickerTileMap.mask = maskBtm;

    // add event listener
    this.pickerInteractLayer = new PIXI.Graphics();
    this.pickerContainer.addChild(this.pickerInteractLayer);
    this.pickerInteractLayer.lineStyle(1, 0xf0f0f0, 2);
    this.pickerInteractLayer.beginFill(0x0000ff, 0.001);
    this.pickerInteractLayer.drawRect(0, 0, pickerAreaW, pickerAreaH);
    this.pickerInteractLayer.endFill();
  }

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

    if (this.mapInterectLayer) {
      this.mapInterectLayer.addEventListener(
        'pointermove',
        this.onPointerMoveOnMap
      );
      this.mapInterectLayer.addEventListener('wheel', this.onWheelMoveOnMap);
    }

    app.stage.interactive = true;
    // this.app.stage.hitArea = renderer.screen;
    app.stage.addEventListener('pointerdown', this.onPointerDownStage);
    app.stage.addEventListener('pointerup', this.onPointerUpStage);
  }

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
  }

  /**
   * Drawing tiles matrix, gap use global settings
   *
   * @param tw
   * @param th
   * @param tiles
   */
  drawTilePicker(tw: number, th: number, tiles: PIXI.Texture[][]) {
    const robot = this.pickerTileMap as PIXI.Container;
    robot.removeChildren(); // cleanup before each draw
    // black background
    const mapAreaW = this.screenRect?.width as number;
    const mapAreaH = (this.screenRect?.height as number) * 0.3;
    const background = new PIXI.Graphics();
    background.beginFill(0x000000);
    background.drawRect(0, 0, mapAreaW, mapAreaH);
    background.endFill();
    robot.addChild(background);

    const gap = 1;

    for (let i = 0; i < tiles.length; i += 1) {
      const row = tiles[i];
      for (let j = 0; j < row.length; j += 1) {
        const xPos = j * (tw + gap);
        const yPos = i * (th + gap);
        background.beginFill(0xffffff, 0.8);
        background.drawRect(xPos, yPos, tw, th);
        background.endFill();
        const texture = tiles[i][j];
        const tile = new Sprite(texture);
        tile.x = xPos;
        tile.y = yPos;
        robot.addChild(tile);
      }
    }
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

      this.rootElement.removeChild(this.app.view);
      this.app = null;
    }
  } // end of destroy()
}
