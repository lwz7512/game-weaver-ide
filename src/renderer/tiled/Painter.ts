/**
 * Created at 2022/11/08
 *
 * 1. completed `layerManager` @2022/12/31
 */
import * as PIXI from 'pixi.js';
import { FederatedPointerEvent } from '@pixi/events';
import { GeneralObject } from '../config';
import { setDrawingSession } from '../state/session';
import { rectEquals } from './Base';
import { TiledCore } from './Core';
import { LayerManager } from './Layers';
import { PointX } from './PointX';
import { SpriteX } from './SpriteX';
import { flattenGrid, gridToPoints } from './Utils';
import { GameWeaverLayer, GWMap, PhaserMap } from '.';

type EventHandler = (event: Event) => void;

export class TiledPainter extends TiledCore {
  // mode flag decide if its painting or erasing
  protected eraseTileMode = false;
  protected translateMode = false;
  // *** action listeners ***
  onPointerDownStage: EventHandler = () => null;
  onPointerUpStage: EventHandler = () => null;
  onPointerMoveOnMap: EventHandler = () => null;
  onWheelMoveOnMap: EventHandler = () => null;
  onClickPaintOnMap: EventHandler = () => null;
  onPointerMoveOnPicker: EventHandler = () => null;
  onWheelMoveOnPicker: EventHandler = () => null;
  onClickTilePicker: EventHandler = () => null;

  /** manager layers operation in one place */
  protected layerManager: LayerManager | undefined;

  // used to decide if need redraw
  protected lastHoverRectInMap: PIXI.Rectangle = PIXI.Rectangle.EMPTY;
  /** start from 1 */
  protected lastHoverColumnIndex = 0;
  /** start from 1 */
  protected lastHoverRowIndex = 0;
  /** for picker hover user */
  protected lastPickerColumnIndex = 0;
  protected lastPickerRowIndex = 0;

  protected mapName: string | null = null;
  protected tilesetImage: string | null = null;

  /**
   * Add interaction of drawing events
   *
   * @param session
   * @returns
   */
  create(session?: GeneralObject): PIXI.Application {
    const app = super.create(session);
    this.listen(app);
    return app;
  }

  layout(
    mapWidth: number,
    mapHeight: number,
    tileWidth: number,
    tileHeight: number
  ) {
    // console.log(`>>> layout width new size: `);
    // console.log(`${mapWidth}/${mapHeight}/${tileWidth}/${tileHeight}`);
    super.layout(mapWidth, mapHeight, tileWidth, tileHeight);
    this.layerManager = new LayerManager(mapWidth, mapHeight);
    this.layerManager.addNewLayer(1, 'Layer - 1');
  }

  setEraseMode(enabled: boolean) {
    this.eraseTileMode = enabled;
    this.hoveredMapLayer?.clear();
  }

  setTranslateMode(enabled: boolean) {
    this.translateMode = enabled;
  }

  addNewLayer(id: number, name: string) {
    this.layerManager?.addNewLayer(id, name);
  }

  deleteLayer(id: number) {
    this.layerManager?.deleteLayer(id);
    const tiles = this.layerManager?.removeSpritesByLayerId(id);
    tiles && this.clearTilesFromMap(tiles);
  }

  eraseTileInCurrentLayer() {
    const tiles = this.layerManager?.clearTilesInCurrentLayer();
    tiles && this.clearTilesFromMap(tiles);
  }

  renameLayer(id: number, name: string) {
    this.layerManager?.renameLayer(id, name);
  }

  selectLayer(id: number) {
    this.layerManager?.selectLayer(id);
  }

  moveSelectedLayerUp() {
    this.layerManager?.moveSelectedLayerUp();
  }

  moveSelectedLayerDown() {
    this.layerManager?.moveSelectedLayerDown();
  }

  toggleLayerVisible(layerId: number, visible: boolean) {
    this.layerManager?.toggleLayerVisible(layerId, visible);
  }

  toggleLayerAvailable(layerId: number, locked: boolean) {
    this.layerManager?.toggleLayerAvailable(layerId, locked);
  }

  buildLayersBy(width: number, height: number, layers: GameWeaverLayer[]) {
    // console.log(`>> build layers...`);
    this.layerManager?.resetLayers(width, height, layers);
  }

  cleanupAll() {
    // console.log(`>>> clean up all!`);
    this.layerManager?.cleanup();
    this.cleanupTiles();
  }

  /**
   * Rebuilt sprites in map for layers of loaded map source
   * @param layers
   */
  paintSpritesFrom(layers: GameWeaverLayer[]) {
    this.cleanupTiles();
    this.layerManager?.clear();

    layers.forEach(({ id, grid }) => {
      const points = this.tileLayerGridToPointXs(grid);
      points.forEach(({ x, y, tile }) => {
        if (!tile) return;
        const sprite = this.putTileOnGameMap(id, x, y, tile);
        const col = x + 1;
        const row = y + 1;
        if (!sprite) return console.warn('no sprite created!');
        this.layerManager?.addOneTile(id, col, row, tile, sprite);
      });
    });
  }

  tileLayerGridToPointXs(grid: number[][]): PointX[] {
    const points: PointX[] = [];
    for (let y = 0; y < grid.length; y += 1) {
      for (let x = 0; x < grid[y].length; x += 1) {
        const ptx = new PointX(x, y);
        ptx.tile = grid[y][x]; // got tile id
        points.push(ptx);
      }
    }
    return points;
  }

  /**
   * Export game weaver object to phaser map data...
   * @returns layer info
   */
  getPhaserMapInfo(): PhaserMap {
    const layers = this.layerManager ? this.layerManager.toPhaserLayers() : [];
    return {
      type: 'map',
      width: this.gameHoriTiles,
      height: this.gameVertTiles,
      infinite: false,
      orientation: 'orthogonal',
      renderorder: 'right-down',
      tileheight: this.tileHeight,
      tilewidth: this.tileWidth,
      layers,
      tilesets: [], // TODO: need to retieve tilesheet image file info...
      version: '0.1',
    };
  }

  /**
   * Save Game Weaver Map object requrired fields.
   *
   * @param name game name
   * @param tilesheetFilePath currently used tilesheet file path
   * @returns
   */
  setGWMapInfo(name: string, tilesheetFilePath: string) {
    this.mapName = name;
    this.tilesetImage = tilesheetFilePath;
  }

  getGWMapInfo(): GWMap {
    const layers = this.layerManager ? this.layerManager.getRawLayers() : [];
    return {
      name: this.mapName || '',
      mapWidth: this.gameHoriTiles,
      mapHeight: this.gameVertTiles,
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
      tilesetImage: this.tilesetImage || '',
      layers,
    };
  }

  /**
   * add action to two main layers:
   * move, pointer down/up, click...
   * @param app
   */
  protected listen(app: PIXI.Application) {
    this.listenOnStageInteraction(app);
    this.listenOnMapInteraction();
    this.listenOnPickerInteraction();
  }

  /**
   * Update layer info with newly added spritex
   * @param layerId
   * @param columnIndex start with 1
   * @param rowIndex start width 1
   * @param tileIndex
   */
  protected savePaintedTileFor(
    layerId: number,
    columnIndex: number,
    rowIndex: number,
    tileId: number,
    tile: SpriteX | undefined
  ) {
    const layer = this.layerManager?.addOneTile(
      layerId,
      columnIndex,
      rowIndex,
      tileId,
      tile
    );
    // if (!layer) return;
    // FIXME: refactor to cache game structure ...
  }

  /* ***********************************************************
   * 1. Handle stage interaction:
   * pointer down & up events
   * @param app
   */
  listenOnStageInteraction(app: PIXI.Application) {
    this.onPointerDownStage = (event: Event) => {
      this.stagePressed = true;
      const fdEvent = event as FederatedPointerEvent;
      this.clickStartXpos = fdEvent.globalX;
      this.clickStartYpos = fdEvent.globalY;
      const pt = new PIXI.Point(fdEvent.globalX, fdEvent.globalY);
      const tilegrid = this.buildTileGridInMap();
      // save the touch state
      this.touchedTileMap = this.isTouchedGrid(pt, tilegrid);
    };

    this.onPointerUpStage = (event: Event) => {
      this.stagePressed = false;
    };

    app.stage.interactive = true;
    // this.app.stage.hitArea = renderer.screen;
    app.stage.addEventListener('pointerdown', this.onPointerDownStage);
    app.stage.addEventListener('pointerup', this.onPointerUpStage);
    app.stage.addEventListener('pointerupoutside', this.onPointerUpStage);
  }

  findTexture(layer: number, x: number, y: number) {
    return this.layerManager?.findTextureIdFromLayer(layer, x, y) || 0;
  }

  findTextures(x: number, y: number) {
    return this.layerManager?.findTextureIdsFromLayers(x, y) || [];
  }

  getLayerId() {
    return this.layerManager?.getCurrentLayerId();
  }

  /* ***********************************************************
   * 2. Handle map interaction:
   * pointer move, wheel scroll, click events
   */
  listenOnMapInteraction() {
    this.onPointerMoveOnMap = (event: Event) => {
      const fdEvent = event as FederatedPointerEvent;
      const currentX = fdEvent.globalX;
      const currentY = fdEvent.globalY;
      const point = new PIXI.Point(currentX, currentY);
      const grid = this.buildTileGridInMap();
      const hitRect = this.containInGrid(point, grid);
      const currentLayerId = this.getLayerId() || 1;
      // Note here: x actually represent columnIndex, y represent rowIndex
      // both start from 1 while moving inside of map
      const [col, row] = this.findCoordinateFromTileGrid(hitRect, grid);
      if (!col || !row) return; // move outside of grid

      const id = this.findTexture(currentLayerId, col - 1, row - 1);
      const textureIds = this.findTextures(col - 1, row - 1);

      // CASE 1: if stage untouched, trying to show tile highlighter ...
      if (!this.stagePressed) {
        if (this.isEmptyRect(hitRect)) return;
        if (rectEquals(hitRect, this.lastHoverRectInMap)) return;
        // 0. *** save visited cell after painting!! ***
        this.lastHoverRectInMap = hitRect;
        // *** save last valid position, and exclude (0,0) which is outside of grid!
        if (col) this.lastHoverColumnIndex = col;
        if (row) this.lastHoverRowIndex = row;

        // 1. paint highlighter
        this.paintHighlighterWithMode();
        // 2. display cell info
        this.showCurrentCell(`(${col},${row}) [${id}] - L${currentLayerId}`);
        // 3. display tiles under mouse
        this.revealTilesUnderMouse(textureIds.reverse());
        return;
      }
      // CASE 2: or touched on map, do painting!
      if (this.touchedTileMap && !this.translateMode) {
        // do continuous painting with with the same texuture, smearing operation
        if (rectEquals(hitRect, this.lastHoverRectInMap)) return;
        // save to go
        window.requestAnimationFrame(() => {
          if (this.eraseTileMode) {
            this.paintEraserOnGameMap(hitRect);
            return this.safelyEraseTile(currentLayerId, hitRect, grid);
          }
          // *** DOING TEXTURE PAINTING HERE ***
          this.paintHiligherOnGameMap(hitRect);
          this.safelyPaintTile(currentLayerId, hitRect, grid);
        });
        this.lastHoverRectInMap = hitRect;
        return;
      }

      // console.log(`moving map...`);
      // CASE 3: touched on the blank canvas, now allowed to translate grid ...
      const diffX = fdEvent.movementX * 0.6;
      const diffY = fdEvent.movementY * 0.6;
      this.translateGameMap(diffX, diffY);
      this.translateHighlighter();
    };

    this.onWheelMoveOnMap = (event: Event) => {
      const wheelEvt = event as WheelEvent;
      const scaleDiff = wheelEvt.deltaY * -0.01;
      const currentMapScale = this.mapScale + scaleDiff;
      // Restrict scale
      if (currentMapScale < 0.3 || currentMapScale > 2) return; // stop scaleing

      // *** reset the scale safely ***
      this.mapScale = currentMapScale;

      // figure out the zoom position
      const horiZoomRatio =
        (this.lastHoverColumnIndex - 1) / this.gameHoriTiles;
      const vertZoomRatio = (this.lastHoverRowIndex - 1) / this.gameVertTiles;
      // move to center
      const diffWidth =
        this.gameHoriTiles * this.tileWidth * scaleDiff * horiZoomRatio;
      const diffHeight =
        this.gameVertTiles * this.tileHeight * scaleDiff * vertZoomRatio;

      // *** update map drawing starting point
      this.mapMarginX -= diffWidth;
      this.mapMarginY -= diffHeight;

      // redraw everything
      this.drawMapGrid();
      this.scaleTileMap();

      this.paintHighlighterWithMode();
      this.saveMapDimension();
    };

    this.onClickPaintOnMap = (event: Event) => {
      const fdEvent = event as FederatedPointerEvent;
      const pointerX = fdEvent.globalX;
      const pointerY = fdEvent.globalY;
      const sameX = this.clickStartXpos === pointerX;
      const sameY = this.clickStartYpos === pointerY;
      if (!sameX && !sameY) return;

      const point = new PIXI.Point(pointerX, pointerY);
      const grid = this.buildTileGridInMap();
      const hitRect = this.containInGrid(point, grid);
      const currentLayerId = this.layerManager?.getCurrentLayerId() || 1;
      if (this.checkIsNotEmptyRect(hitRect)) {
        if (this.eraseTileMode) {
          return this.safelyEraseTile(currentLayerId, hitRect, grid);
        }
        // *** DOING TEXTURE PAINTING HERE ***
        this.safelyPaintTile(currentLayerId, hitRect, grid);
      }
    };

    if (this.mapInterectLayer) {
      this.mapInterectLayer.addEventListener(
        'pointermove',
        this.onPointerMoveOnMap
      );
      this.mapInterectLayer.addEventListener('wheel', this.onWheelMoveOnMap);
      this.mapInterectLayer.addEventListener('click', this.onClickPaintOnMap);
    }
  }

  /**
   * Draw highligher or picked tile while hover on map
   */
  protected paintHighlighterWithMode() {
    if (this.isEmptyRect(this.lastHoverRectInMap)) return;

    const { x, y } = this.lastHoverRectInMap;
    const tw = this.mapScale * this.tileWidth;
    const th = this.mapScale * this.tileHeight;
    const realTimeRect = new PIXI.Rectangle(x, y, tw, th);
    if (this.eraseTileMode) {
      this.paintEraserOnGameMap(realTimeRect);
    } else {
      this.paintHiligherOnGameMap(realTimeRect, this.translateMode);
    }
  }

  /**
   * redraw highlighter after map translation
   */
  protected translateHighlighter() {
    const grid = this.buildTileGridInMap();
    const realTimeRect = this.findRectangleFromGrid(
      this.lastHoverColumnIndex - 1, // convert to grid index scope
      this.lastHoverRowIndex - 1, // conver to grid index scope
      grid
    );
    if (this.eraseTileMode) {
      this.paintEraserOnGameMap(realTimeRect);
    } else {
      this.paintHiligherOnGameMap(realTimeRect);
    }
  }

  protected safelyPaintTile(
    currentLayerId: number,
    hitRect: PIXI.Rectangle,
    grid: PIXI.Rectangle[][]
  ) {
    const layerAvailable =
      this.layerManager?.checkLayerAvailable(currentLayerId);
    if (!layerAvailable) return;

    const [x, y] = this.findCoordinateFromTileGrid(hitRect, grid);
    const painted = this.layerManager?.checkTileExistence(currentLayerId, x, y);
    if (painted) return;

    const { layerId, columnIndex, rowIndex, textureId, tile } =
      this.paintTileOnGameMap(hitRect, grid, currentLayerId);
    // add new tile to layer manager
    this.savePaintedTileFor(layerId, columnIndex, rowIndex, textureId, tile);
  }

  protected safelyEraseTile(
    currentLayerId: number,
    hitRect: PIXI.Rectangle,
    grid: PIXI.Rectangle[][]
  ) {
    const layerAvailable =
      this.layerManager?.checkLayerAvailable(currentLayerId);
    if (!layerAvailable) return;
    const [x, y] = this.findCoordinateFromTileGrid(hitRect, grid);
    const isExisting = this.layerManager?.checkTileExistence(
      currentLayerId,
      x,
      y
    );
    if (!isExisting) {
      console.warn(`tile not exsiting!`);
      return; // no tile painted
    }
    const tile = this.layerManager?.getTileBy(currentLayerId, x, y);
    tile && this.eraseTileFromGameMap(tile);
    this.layerManager?.clearOneTile(currentLayerId, x, y);
  }

  zoomInMapAndTitles() {
    const result = this.zoomIn();
    if (!result) return;
    this.scaleTileMap();
  }

  zoomOutMapAndTiles() {
    const result = this.zoomOut();
    if (!result) return;
    this.scaleTileMap();
  }

  zoomToRealSize(): void {
    super.zoomToRealSize();
    this.scaleTileMap();
  }

  /**
   * reset the tiles saved in cache!
   */
  protected scaleTileMap() {
    const grid = this.buildTileGridInMap();
    this.layerManager?.scaleAllTiles(grid);
  }

  /* ***********************************************************
   * 3. Handle tile picker interaction:
   * pointer move, wheel scroll, click events
   */
  listenOnPickerInteraction() {
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
      const [x, y] = this.findCoordinateFromTileGrid(hitRect, grid);
      // *** save the last hit cell: (column, row) ***
      this.lastPickerColumnIndex = x;
      this.lastPickerRowIndex = y;
      // console.log(`${x}, ${y}`);
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
      this.translateSelectedTileInPicker(diffX, diffY);
    };

    // scale like the map from mouse position ...
    this.onWheelMoveOnPicker = (event: Event) => {
      if (!this.tiles) return;

      const wheelEvt = event as WheelEvent;
      const scaleDiff = wheelEvt.deltaY * -0.01;
      const estimateScale = this.tileScale + scaleDiff;
      // Restrict scale
      if (estimateScale > 1.5 || estimateScale < 0.5) return;

      // reset scale
      this.tileScale += scaleDiff;

      // figure out the zoom position
      const [tileColumns, tileRows] = this.getTileGridDimension();
      if (!tileColumns || !tileRows) return;

      const horiZoomRatio = (this.lastPickerColumnIndex - 1) / tileColumns;
      const vertZoomRatio = (this.lastPickerRowIndex - 1) / tileRows;

      // // move to center
      const diffWidth =
        tileColumns * this.tileWidth * scaleDiff * horiZoomRatio;
      const diffHeight = tileRows * this.tileHeight * scaleDiff * vertZoomRatio;
      // *** update map drawing starting point
      this.tilesStartX -= diffWidth;
      this.tilesStartY -= diffHeight;

      const tw = this.tileWidth * this.tileScale;
      const th = this.tileHeight * this.tileScale;
      this.scaleTilePicker(tw, th);
      this.scaleSelectedTileInPicker(tw, th);
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
      this.saveLastHitRectangle(hitRect);
    };

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
  }

  /**
   * remove all the events listening
   */
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
        this.mapInterectLayer.removeEventListener(
          'click',
          this.onClickPaintOnMap
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

  // end of class
}
