/**
 * Created at 2022/11/08
 *
 * 1. completed `layerManager` @2022/12/31
 */
import * as PIXI from 'pixi.js';
import { FederatedPointerEvent } from '@pixi/events';
import { GeneralObject } from '../config';
import { checkMacPlatform } from '../utils';
import { rectEquals, EmptyRecT } from './Base';
import { TiledCore, PatternFillCell } from './Core';
import { LayerManager } from './Layers';
import { PointX } from './PointX';
import { SpriteX } from './SpriteX';
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
  /** for picker dragging selection */
  protected startPickerColumnIndex = 0;
  protected startPickerRowIndex = 0;

  protected mapName: string | null = null;
  protected tilesetImage: string | null = null;

  protected stagePressed = false;
  protected clickStartXpos = 0;
  protected clickStartYpos = 0;
  protected touchedTileMap = false;

  /** save predicted filling pattern  */
  protected patternFillCells: PatternFillCell[] = [];

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
    this.cleanupHoveredTile();
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
    // console.log(
    //   `add one tile: ${layerId}, ${columnIndex}, ${rowIndex}, ${tileId}`
    // );
    this.layerManager?.addOneTile(layerId, columnIndex, rowIndex, tileId, tile);
  }

  /* ***********************************************************
   * 1. Handle stage interaction:
   * pointer down & up events
   * @param app
   */
  listenOnStageInteraction(app: PIXI.Application) {
    this.onPointerDownStage = (event: Event) => {
      // mark pressed state
      this.stagePressed = true;

      // FIXME: reset hover rect to enable smearing painting!
      this.lastHoverRectInMap = PIXI.Rectangle.EMPTY;

      const fdEvent = event as FederatedPointerEvent;
      // save the mouse down position
      this.clickStartXpos = fdEvent.globalX;
      this.clickStartYpos = fdEvent.globalY;
      // check touch what...
      const pt = new PIXI.Point(fdEvent.globalX, fdEvent.globalY);
      const tilegrid = this.buildTileGridInMap();
      // save the touch state
      // FIXME: check boundary of map @2023/03/21
      const isUnderBottom = this.isBelowMapBoundary(pt.y);
      this.touchedTileMap = !isUnderBottom && this.isTouchedGrid(pt, tilegrid);

      // touch on map, predict pattern cells ...
      // to figure out rectangles by the selected tiles pattern
      const isPatternFill = this.isPatternFilling();
      if (this.touchedTileMap && isPatternFill) {
        const { globalX, globalY } = fdEvent;
        const point = new PIXI.Point(globalX, globalY);
        const grid = this.buildTileGridInMap();
        const hitRect = this.containInGrid(point, grid);
        // to figure out prediction cells, save to `patternFillCells`
        const predictions = this.predictPatternFillCells(hitRect, grid);
        this.patternFillCells = predictions;
      }

      // touch on picker, save the pressing start cell
      if (!this.touchedTileMap) {
        const { col, row, hitRect } =
          this.checkRectInPickerUnderPointer(fdEvent);
        this.startPickerColumnIndex = col;
        this.startPickerRowIndex = row;
        console.log(`start from: ${col}, ${row}`);
        this.saveStartHitRectangle(hitRect);
      }
      // check ctrl key state
      const isMapOS = checkMacPlatform();
      const isCtrlHolded = isMapOS ? fdEvent.metaKey : fdEvent.ctrlKey;
      if (isCtrlHolded) {
        this.ctrlKeyPressed = true;
      }
    };

    this.onPointerUpStage = (event: Event) => {
      // restore to no pressed
      this.stagePressed = false;
      // restore to no ctrl
      this.ctrlKeyPressed = false;
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

      // CASE 1: if stage untouched, trying to show tile highlighter ...
      if (!this.stagePressed) {
        if (this.isEmptyRect(hitRect)) return;
        if (rectEquals(hitRect, this.lastHoverRectInMap)) return;
        // Note here: x actually represent columnIndex, y represent rowIndex
        // both start from 1 while moving inside of map
        const [col, row] = this.findCoordinateFromTileGrid(hitRect, grid);
        if (!col || !row) return; // move outside of grid

        // 0. *** save visited cell after painting!! ***
        this.lastHoverRectInMap = hitRect;
        // *** save last valid position, and exclude (0,0) which is outside of grid!
        if (col) this.lastHoverColumnIndex = col;
        if (row) this.lastHoverRowIndex = row;

        const id = this.findTexture(currentLayerId, col - 1, row - 1);
        const textureIds = this.findTextures(col - 1, row - 1);
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
        if (rectEquals(hitRect, this.lastHoverRectInMap)) {
          // console.warn(`> hitRect is the same as lastHoverRect`);
          return;
        }
        // save to go
        window.requestAnimationFrame(() => {
          if (this.eraseTileMode) {
            this.paintEraserOnGameMap(hitRect);
            return this.safelyEraseTile(currentLayerId, hitRect, grid);
          }
          this.paintHiligherOnGameMap(hitRect);
          // do pattern fillig by smearing on map
          if (this.isPatternFilling()) {
            this.smearingPatternBy(currentLayerId, hitRect, grid);
            return;
          }
          // *** DOING SINGLE TEXTURE PAINTING HERE ***
          this.safelyPaintTile(currentLayerId, hitRect, grid);
        });
        this.lastHoverRectInMap = hitRect;
        // if hitRect outside of predictions,
        const isMovingOnPredictions = this.isInsidePredictions(
          hitRect,
          this.patternFillCells
        );
        if (isMovingOnPredictions) return; // continue painting with pattern
        console.log(`>> reset pattern cells!`);
        // reset predictions
        this.patternFillCells = this.predictPatternFillCells(hitRect, grid);
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
      // ensure this is real click, not dragging and release!
      if (!sameX && !sameY) return;

      const point = new PIXI.Point(pointerX, pointerY);
      const grid = this.buildTileGridInMap();
      const hitRect = this.containInGrid(point, grid);
      const currentLayerId = this.layerManager?.getCurrentLayerId() || 1;
      if (this.checkIsNotEmptyRect(hitRect)) {
        // First: check if erasing
        if (this.eraseTileMode) {
          return this.safelyEraseTile(currentLayerId, hitRect, grid);
        }
        // Second: drawing with pattern ...
        if (this.isPatternFilling()) {
          return this.safePaintPattern(
            currentLayerId,
            grid,
            this.patternFillCells
          );
        }
        // Third: *** DOING SINGLE TEXTURE PAINTING HERE ***
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
   * Consider filling with pattern mode ...
   * @2023/03/21
   * @returns
   */
  fillFloodCurrentLayer() {
    // clear layer first
    this.eraseTileInCurrentLayer();
    // safety check
    const currentLayer = this.layerManager?.getCurrentLayerId();
    if (!currentLayer) return;
    const textureId = this.getSelectedTextureId();
    if (!textureId) return;
    // then draw all
    if (this.isPatternFilling()) {
      const grid = this.buildTileGridInMap();
      const predictions = this.predictPatternFloodCells(grid);
      this.safePaintPattern(currentLayer, grid, predictions);
    } else {
      const sprites = this.fillTileOnGameMap(currentLayer);
      this.layerManager?.floodFillTile(currentLayer, textureId, sprites);
    }
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
        const xInPattern = (x - col) % w;
        const yInPattern = (y - row) % h;
        const textureIndex = yInPattern * w + xInPattern;
        const texturePair = textures[textureIndex];
        if (!rectEquals(cell, EmptyRecT) && texturePair) {
          cells.push({
            hitRect: cell,
            column: x + 1,
            row: y + 1,
            texture: texturePair.texture, // leave this to next `map` loop
            textureId: texturePair.id, // leave this to next `map` loop
            painted: false,
          });
        }
      }
    }
    return cells;
  }

  /**
   * Create a list of predictions for the whole grid with selected pattern
   * @param grid Map grid to flood fill
   */
  protected predictPatternFloodCells(grid: PIXI.Rectangle[][]) {
    const textures = this.getSelectedTextures();
    const [w, h] = this.getTilesPatternSize();
    const cells: PatternFillCell[] = [];
    for (let x = 0; x < this.gameHoriTiles; x += 1) {
      for (let y = 0; y < this.gameVertTiles; y += 1) {
        const cell = this.findRectangleFromGrid(x, y, grid);
        const xInPattern = x % w;
        const yInPattern = y % h;
        const textureIndex = yInPattern * w + xInPattern;
        const { id, texture } = textures[textureIndex];
        cells.push({
          hitRect: cell,
          column: x + 1,
          row: y + 1,
          texture,
          textureId: id,
          painted: false,
        });
      }
    }
    return cells;
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

  /**
   * Paint one selected tile
   * @param currentLayerId
   * @param hitRect
   * @param grid
   * @returns
   */
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

  /**
   * Paint a pattern for selected tiles from saved `patternFillCells`
   * @param currentLayerId layer id
   * @param grid map grid
   * @param cells predictions to apply
   * @returns
   */
  protected safePaintPattern(
    currentLayerId: number,
    grid: PIXI.Rectangle[][],
    cells: PatternFillCell[]
  ) {
    // STEP 1: check layer availability
    const layerAvailable =
      this.layerManager?.checkLayerAvailable(currentLayerId);
    if (!layerAvailable) return;
    // STEP 2: clear existing tiles in predicted cells
    cells.forEach((cell) =>
      this.safelyEraseTile(currentLayerId, cell.hitRect, grid)
    );
    // STEP 3: draw pattern cells one by one
    cells.forEach((cell) => {
      if (!cell.texture) return;
      const tile = this.paintOneTextureBy(
        currentLayerId,
        cell.row,
        cell.column,
        cell.hitRect,
        cell.texture
      );
      // STEP 4: save tile to layer manager
      this.savePaintedTileFor(
        currentLayerId,
        cell.column,
        cell.row,
        cell.textureId,
        tile
      );
    });
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
      // console.log(`tile not exsiting, no need to erase...`);
      return; // no tile painted
    }
    const tile = this.layerManager?.getTileBy(currentLayerId, x, y);
    tile && this.eraseTileFromGameMap(tile);
    this.layerManager?.clearOneTile(currentLayerId, x, y);
  }

  /**
   * Check `hitRect` if inside of predictions and paint the corresponding tile one by one
   * @param currentLayerId
   * @param hitRect
   * @param grid
   */
  protected smearingPatternBy(
    currentLayerId: number,
    hitRect: PIXI.Rectangle,
    grid: PIXI.Rectangle[][]
  ) {
    const layerAvailable =
      this.layerManager?.checkLayerAvailable(currentLayerId);
    if (!layerAvailable) return;
    this.safelyEraseTile(currentLayerId, hitRect, grid);

    const prediction = this.patternFillCells.find((p) =>
      rectEquals(p.hitRect, hitRect)
    );
    if (!prediction) return console.warn(`no prediction`);
    if (!prediction.texture) return console.warn(`no texuture!`);
    // console.log(`start smearing...`);
    // STEP 3: draw one tile
    const tile = this.paintOneTextureBy(
      currentLayerId,
      prediction.row,
      prediction.column,
      prediction.hitRect,
      prediction.texture
    );
    // STEP 4: save tile to layer manager
    this.savePaintedTileFor(
      currentLayerId,
      prediction.column,
      prediction.row,
      prediction.textureId,
      tile
    );
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

  checkRectInPickerUnderPointer(fdEvent: FederatedPointerEvent) {
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
    return {
      col: x,
      row: y,
      hitRect,
    };
  }

  /* ***********************************************************
   * 3. Handle tile picker interaction:
   * pointer move, wheel scroll, click events
   */
  listenOnPickerInteraction() {
    // Check CTRL key to select multple tiles by dragging selection!
    // while CTRL holded, the tile picker will be not movable!
    this.onPointerMoveOnPicker = (event: Event) => {
      const fdEvent = event as FederatedPointerEvent;
      // drawing the tile highlight rectangle in the `selectedTileLayer`
      const { col, row, hitRect } = this.checkRectInPickerUnderPointer(fdEvent);
      // *** save the last hit cell: (column, row) ***
      this.lastPickerColumnIndex = col;
      this.lastPickerRowIndex = row;
      // console.log(`move to: ${col}, ${row}`);

      // draw highlighter...
      if (!rectEquals(hitRect, this.lastHoverRectInPicker)) {
        window.requestAnimationFrame(() =>
          this.drawTilePickerHoverRects(hitRect)
        );
        this.lastHoverRectInPicker = hitRect;
      }

      if (!this.stagePressed) return;

      // START MULTIPLE TILE SELECTION...
      // 1. save last hit rectangle
      // 2. draw multiple cells
      if (this.ctrlKeyPressed) {
        this.saveLastHitRectangle(hitRect);
        this.drawSelectionsInPickerBy(
          this.startPickerColumnIndex,
          this.startPickerRowIndex,
          this.lastPickerColumnIndex,
          this.lastPickerRowIndex
        );
        return;
      }

      // pointer pressed, then move the total tiles...
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

    /**
     * draw selected cell(border & fill) on background graphics...
     * lastly occured after mouse up!
     */
    this.onClickTilePicker = (event: Event) => {
      const fdEvent = event as FederatedPointerEvent;
      const screenRect = this.screenRect as PIXI.Rectangle;
      const pickerYOffset = screenRect.height * this.mapHeightRatio;
      const { globalX, globalY } = fdEvent;
      const pointerX = globalX;
      const pointerY = globalY - pickerYOffset;

      // draw selected tile
      const point = new PIXI.Point(pointerX, pointerY);
      const grid = this.buildTileGridInPicker();
      const hitRect = this.containInGrid(point, grid);
      this.saveLastHitRectangle(hitRect);
      this.drawTilePickerHoverRects(hitRect);

      // check real click
      const sameX = this.clickStartXpos === globalX;
      const sameY = this.clickStartYpos === globalY;
      // ensure this is real click, not dragging and release!
      if (sameX && sameY) {
        // TODO: cleanup multiple selection...
      }
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
