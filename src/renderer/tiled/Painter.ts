/**
 * Created at 2022/11/08
 */
import * as PIXI from 'pixi.js';
import { FederatedPointerEvent } from '@pixi/events';
import { rectEquals } from './Base';
import { DrawingSession } from '../config';
import { TiledCore } from './Core';

type EventHandler = (event: Event) => void;

export class TiledPainter extends TiledCore {
  // *** action listeners ***
  onPointerDownStage: EventHandler = () => null;
  onPointerUpStage: EventHandler = () => null;
  onPointerMoveOnMap: EventHandler = () => null;
  onWheelMoveOnMap: EventHandler = () => null;
  onClickPaintOnMap: EventHandler = () => null;
  onPointerMoveOnPicker: EventHandler = () => null;
  onWheelMoveOnPicker: EventHandler = () => null;
  onClickTilePicker: EventHandler = () => null;
  // mode flag decide if its painting or erasing
  eraseTileMode = false;

  /**
   * Add interaction of drawing events
   *
   * @param session
   * @returns
   */
  create(session?: DrawingSession): PIXI.Application {
    const app = super.create(session);
    this.listen(app);
    return app;
  }

  setEraseMode(enabled: boolean) {
    this.eraseTileMode = enabled;
  }

  /**
   * add action to two main layers:
   * move, pointer down/up, click...
   * @param app
   */
  protected listen(app: PIXI.Application) {
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

    this.onPointerMoveOnMap = (event: Event) => {
      const fdEvent = event as FederatedPointerEvent;
      const currentX = fdEvent.globalX;
      const currentY = fdEvent.globalY;
      const point = new PIXI.Point(currentX, currentY);
      const grid = this.buildTileGridInMap();
      const hitRect = this.containInGrid(point, grid);
      // if stage untouched, trying to show tile highlighter ...
      if (!this.stagePressed) {
        if (rectEquals(hitRect, this.lastHoverRectInMap)) return;
        if (this.eraseTileMode) {
          this.paintEraserOnGameMap(hitRect);
        } else {
          this.paintHiligherOnGameMap(hitRect);
        }
        this.lastHoverRectInMap = hitRect;
        return;
      }
      // or touched on map, do nothing!
      if (this.touchedTileMap) {
        // do continuous painting with with the same texuture, smearing operation
        if (rectEquals(hitRect, this.lastHoverRectInMap)) return;
        // save to go
        window.requestAnimationFrame(() => {
          if (this.eraseTileMode) {
            this.paintEraserOnGameMap(hitRect);
            return this.eraseTileFromGameMap(hitRect, grid);
          }
          this.paintTileOnGameMap(hitRect, grid);
          this.paintHiligherOnGameMap(hitRect);
        });
        this.lastHoverRectInMap = hitRect;
        return;
      }

      // now allowed to translate grid ...
      const diffX = fdEvent.movementX * 0.6;
      const diffY = fdEvent.movementY * 0.6;

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
      this.scaleTileMap();
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
      if (this.checkIsNotEmptyRect(hitRect)) {
        this.paintTileOnGameMap(hitRect, grid);
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
