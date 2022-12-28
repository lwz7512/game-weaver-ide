/**
 * Created at 2022/11/08
 */
import * as PIXI from 'pixi.js';
import { FederatedPointerEvent } from '@pixi/events';
import { rectEquals } from './Base';
import { GeneralObject } from '../config';
import { TiledCore } from './Core';
import { LayerManager } from './Layers';
import { SpriteX } from './SpriteX';
import {
  setDrawingSession,
  getSessionBy,
  clearPaintedTiles,
} from '../state/session';

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
      // if stage untouched, trying to show tile highlighter ...
      if (!this.stagePressed) {
        if (rectEquals(hitRect, this.lastHoverRectInMap)) return;
        if (this.eraseTileMode) {
          this.paintEraserOnGameMap(hitRect);
        } else {
          this.paintHiligherOnGameMap(hitRect, this.translateMode);
        }
        this.lastHoverRectInMap = hitRect;
        // display cell info
        const [x, y] = this.findCoordinateFromTileGrid(hitRect, grid);
        const id = this.layerManager?.findTextureIdFromLayer(
          currentLayerId,
          x,
          y
        );
        this.showCurrentCell(`(${y},${x}) [${id}] - L${currentLayerId}`);
        return;
      }
      // or touched on map, do painting!
      if (this.touchedTileMap && !this.translateMode) {
        // do continuous painting with with the same texuture, smearing operation
        if (rectEquals(hitRect, this.lastHoverRectInMap)) return;
        // save to go
        window.requestAnimationFrame(() => {
          if (this.eraseTileMode) {
            this.paintEraserOnGameMap(hitRect);
            return this.eraseTileFromGameMap(hitRect, grid);
          }
          // *** NOTE: DOING TEXTURE PAINTING HERE ***
          this.paintHiligherOnGameMap(hitRect);
          const { layerId, columnIndex, rowIndex, textureId, tile } =
            this.paintTileOnGameMap(hitRect, grid, currentLayerId);
          this.savePaintedTileFor(
            layerId,
            columnIndex,
            rowIndex,
            textureId,
            tile
          );
        });
        this.lastHoverRectInMap = hitRect;
        return;
      }

      // now allowed to translate grid ...
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
          return this.eraseTileFromGameMap(hitRect, grid);
        }
        // *** NOTE: DOING TEXTURE PAINTING HERE ***
        const { layerId, columnIndex, rowIndex, textureId, tile } =
          this.paintTileOnGameMap(hitRect, grid, currentLayerId);
        this.savePaintedTileFor(
          layerId,
          columnIndex,
          rowIndex,
          textureId,
          tile
        );
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
