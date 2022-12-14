/**
 * Created at 2022/11/08
 *
 * 1. completed `layerManager` @2022/12/31
 */
import * as PIXI from 'pixi.js';
import { FederatedPointerEvent } from '@pixi/events';
import { rectEquals } from './Base';
import { GeneralObject } from '../config';
import { TiledCore } from './Core';
import { LayerManager } from './Layers';
import { SpriteX } from './SpriteX';
import { setDrawingSession } from '../state/session';

type EventHandler = (event: Event) => void;

export class TiledPainter extends TiledCore {
  // used to decide if need redraw
  lastHoverRectInMap: PIXI.Rectangle = PIXI.Rectangle.EMPTY;
  // mode flag decide if its painting or erasing
  eraseTileMode = false;
  translateMode = false;
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
    this.cleanupHoveredTile();
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
   * update layer info
   * @param layerId
   * @param columnIndex
   * @param rowIndex
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
    if (!layer) return;
    // FIXME: refactor to cache game structure ...
    setDrawingSession({
      layerPainted: true,
      rowSize: layer.grid.length,
      columnSize: layer.grid[0].length,
      [`layer_${layerId}`]: this.flattenGrid(layer.grid),
    });
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
      const currentLayerId = this.layerManager?.getCurrentLayerId() || 1;
      // CASE 1: if stage untouched, trying to show tile highlighter ...
      if (!this.stagePressed) {
        if (rectEquals(hitRect, this.lastHoverRectInMap)) return;
        if (this.eraseTileMode) {
          this.paintEraserOnGameMap(hitRect);
        } else {
          this.paintHiligherOnGameMap(hitRect, this.translateMode);
        }
        // save visited cell after painting!!
        this.lastHoverRectInMap = hitRect;
        // display cell info
        const [x, y] = this.findCoordinateFromTileGrid(hitRect, grid);
        const id = this.layerManager?.findTextureIdFromLayer(
          currentLayerId,
          x,
          y
        );
        this.showCurrentCell(`(${y},${x}) [${id}] - L${currentLayerId}`);
        // display tiles under mouse
        const textureIds =
          this.layerManager?.findTextureIdsFromLayers(x, y) || [];
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
          // *** NOTE: DOING TEXTURE PAINTING HERE ***
          this.paintHiligherOnGameMap(hitRect);
          this.safelyPaintTile(currentLayerId, hitRect, grid);
        });
        this.lastHoverRectInMap = hitRect;
        return;
      }

      // CASE 3: touched on the blank canvas, now allowed to translate grid ...
      const diffX = fdEvent.movementX * 0.6;
      const diffY = fdEvent.movementY * 0.6;
      this.translateGameMap(diffX, diffY);
    };

    this.onWheelMoveOnMap = (event: Event) => {
      const wheelEvt = event as WheelEvent;
      const scaleDiff = wheelEvt.deltaY * -0.01;
      const currentMapScale = this.mapScale + scaleDiff;
      // Restrict scale
      if (currentMapScale < 0.3 || currentMapScale > 2) return; // stop scaleing
      // safely set the scale
      this.mapScale = currentMapScale;
      // move to center
      const diffWidth = this.gameHoriTiles * this.tileWidth * scaleDiff * 0.5;
      const diffHeight = this.gameVertTiles * this.tileHeight * scaleDiff * 0.5;
      this.mapMarginX -= diffWidth;
      this.mapMarginY -= diffHeight;

      this.drawMapGrid();
      this.scaleTileMap();
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
        // *** NOTE: DOING TEXTURE PAINTING HERE ***
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
    if (!isExisting) return; // no tile painted
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

    this.onWheelMoveOnPicker = (event: Event) => {
      const wheelEvt = event as WheelEvent;
      const scaleDiff = wheelEvt.deltaY * -0.01;
      this.tileScale += scaleDiff;
      // Restrict scale
      this.tileScale = Math.min(Math.max(0.5, this.tileScale), 1.5);
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
