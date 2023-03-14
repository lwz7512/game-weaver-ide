import { Rectangle } from 'pixi.js';
import { SpriteX } from './SpriteX';
import { getSessionBy } from '../state/session';
import { TileLegend, GameWeaverLayer, PhaserMapLayer } from '.';
import { flattenGrid } from './Utils';

type LayerTextureType = number[] | number | undefined;

export class LayerManager {
  protected mapWidth = 0;
  protected mapHeight = 0;
  protected gameMapLayersInfo: GameWeaverLayer[] = [];

  /**
   * Painted tile coordinates cache
   * save the relationship with (x_y : sprite) pair
   * key `{$layerId}_${x}_${y}` indicate the tile index from tile row and column;
   * value sprite indicate the displayobject in the map
   */
  protected paintedTilesCache = new Map<string, SpriteX>();

  constructor(width: number, height: number) {
    this.mapWidth = width;
    this.mapHeight = height;
  }

  /**
   * Retrieve raw & reflectable layer info to persist in map file
   * @returns raw layers with complete info
   */
  getRawLayers() {
    return this.gameMapLayersInfo;
  }

  /**
   * Convert layers into serializable layers
   * @returns serializable map layers for phaser game
   */
  toPhaserLayers(): PhaserMapLayer[] {
    return this.gameMapLayersInfo.map((layer) => ({
      x: 0,
      y: 0,
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      width: layer.width, // hori tile count
      height: layer.height, // vert tile count
      type: 'tilelayer',
      opacity: 1,
      data: flattenGrid(layer.grid), // FLATTEN...
    }));
  }

  /**
   * Cache spritex, and save one tile id to grid:
   * be careful to the relation between colum/row params and `layer.grid`,
   * layer.grid is 2D array, so grid array index should be less 1 than col/row value.
   * @param layerId
   * @param col column index, start from 1
   * @param row row index, start from 1
   * @param tileId
   * @param tile
   * @returns
   */
  addOneTile(
    layerId: number,
    col: number,
    row: number,
    tileId: number,
    tile: SpriteX | undefined
  ) {
    const layer = this.gameMapLayersInfo.find((l) => l.id === layerId);
    if (!layer) {
      console.warn('No layer found!');
      return null;
    }

    if (row === 0 || col === 0) return;

    // console.log(`>>> add tile to: ${row}|${col}`);
    // save texuture id to grid
    // FIXME: Beware that grid index should less 1!
    // @2023/02/12
    layer.grid[row - 1][col - 1] = tileId;
    const key = `${layerId}_${col}_${row}`;
    if (tile) {
      // console.log(`>>> to cache spritex!`);
      this.paintedTilesCache.set(key, tile);
    }
    return layer;
  }

  floodFillTile(layerId: number, tileId: number, tiles: SpriteX[]) {
    tiles.forEach((t) => {
      this.paintedTilesCache.set(t.globalKey, t);
    });
    const layer = this.gameMapLayersInfo.find((l) => l.id === layerId);
    if (!layer) {
      console.warn('No layer found!');
      return;
    }
    layer.grid.forEach((row) => row.fill(tileId));
  }

  checkTileExistence(layerId: number, col: number, row: number) {
    return this.paintedTilesCache.has(`${layerId}_${col}_${row}`);
  }

  getTileBy(layerId: number, col: number, row: number) {
    return this.paintedTilesCache.get(`${layerId}_${col}_${row}`);
  }

  checkLayerLocked(layerId: number) {
    const layer = this.gameMapLayersInfo.find((l) => l.id === layerId);
    return !!layer?.locked;
  }

  checkLayerVisible(layerId: number) {
    const layer = this.gameMapLayersInfo.find((l) => l.id === layerId);
    return !!layer?.visible;
  }

  checkLayerAvailable(layerId: number) {
    return !this.checkLayerLocked(layerId) && this.checkLayerVisible(layerId);
  }

  /**
   * clear tile with col & row number
   * @param layerId
   * @param col horizontal position, start from 1
   * @param row vertical postion, start from 1
   * @returns
   */
  clearOneTile(layerId: number, col: number, row: number) {
    const layer = this.gameMapLayersInfo.find((l) => l.id === layerId);
    if (!layer) {
      console.warn('No layer found!');
      return;
    }
    // FIXME: beware these are index in grid
    layer.grid[row - 1][col - 1] = 0;
    // clear from cache
    this.paintedTilesCache.delete(`${layerId}_${col}_${row}`);
    this.paintedTilesCache.forEach((s, key) => console.log(key));
  }

  lockLayer(layerId: number, lockOrNot: boolean) {
    const layer = this.gameMapLayersInfo.find((l) => l.id === layerId);
    if (!layer) {
      console.warn('No layer found!');
      return;
    }
    layer.locked = lockOrNot;
  }

  visualizeLayer(layerId: number, hideOrNot: boolean) {
    const layer = this.gameMapLayersInfo.find((l) => l.id === layerId);
    if (!layer) {
      console.warn('No layer found!');
      return;
    }
    layer.locked = true;
  }

  addNewLayer(id: number, name: string) {
    this.createNewLayer(id, name);
    this.selectGameLayer(id);
  }

  /**
   * recreate all the layers
   * @param width
   * @param height
   * @param layers
   */
  resetLayers(width: number, height: number, layers: GameWeaverLayer[]) {
    this.mapWidth = width;
    this.mapHeight = height;

    this.gameMapLayersInfo.length = 0;
    this.gameMapLayersInfo.push(...layers);
    // console.log(this.gameMapLayersInfo);
  }

  deleteLayer(id: number) {
    const layers = this.gameMapLayersInfo;
    if (layers.length === 1) return;
    // delete one
    const index = layers.findIndex((l) => l.id === id);
    layers.splice(index, 1);
    // select next
    if (layers[index]) {
      layers[index].selected = true;
    } else {
      layers[0].selected = true;
    }
  }

  renameLayer(id: number, name: string) {
    const layers = this.gameMapLayersInfo;
    const layer = layers.find((l) => l.id === id);
    if (layer) {
      layer.name = name;
    }
  }

  selectLayer(id: number) {
    const layers = this.gameMapLayersInfo;
    layers.forEach((l) => {
      l.selected = false;
      if (l.id === id) {
        l.selected = true;
      }
    });
  }

  moveSelectedLayerUp() {
    const layers = this.gameMapLayersInfo;
    const selectedIndex = layers.findIndex((l) => l.selected);
    if (selectedIndex === 0) return; // start of layers
    const prevLayer = layers[selectedIndex - 1];
    const currentLayer = layers[selectedIndex];
    // exchange layer z-index property
    const currentZindex = currentLayer.zIndex;
    currentLayer.zIndex = prevLayer.zIndex;
    prevLayer.zIndex = currentZindex;
    // exchange layer position
    layers[selectedIndex - 1] = currentLayer;
    layers[selectedIndex] = prevLayer;
    // update all the z-index of sprites
    this.syncSpriteZindexWithLayer();
  }

  moveSelectedLayerDown() {
    const layers = this.gameMapLayersInfo;
    const selectedIndex = layers.findIndex((l) => l.selected);
    if (selectedIndex === layers.length - 1) return; // end of layers
    const nextLayer = layers[selectedIndex + 1];
    const currentLayer = layers[selectedIndex];
    // exchange layer z-index property
    const currentZindex = currentLayer.zIndex;
    currentLayer.zIndex = nextLayer.zIndex;
    nextLayer.zIndex = currentZindex;
    // exchange layer position
    layers[selectedIndex + 1] = layers[selectedIndex];
    layers[selectedIndex] = nextLayer;
    // update all the z-index of sprites
    this.syncSpriteZindexWithLayer();
  }

  /**
   * hide sprite of this layer
   * @param layerId
   * @param visible
   */
  toggleLayerVisible(layerId: number, visible: boolean) {
    const layers = this.gameMapLayersInfo;
    const targetLayer = layers.find((l) => l.id === layerId);
    if (targetLayer) {
      targetLayer.visible = visible;
    }
    console.log(`hiding layer: ${layerId}`);

    this.paintedTilesCache.forEach((s) => {
      console.log(`> sprite in layer: ${s.layer}`);
      if (s.layer === layerId) {
        s.visible = visible;
      }
    });
  }

  /**
   * disable layer to put tiles
   * @param layerId
   * @param locked
   */
  toggleLayerAvailable(layerId: number, locked: boolean) {
    const layers = this.gameMapLayersInfo;
    const targetLayer = layers.find((l) => l.id === layerId);
    if (targetLayer) {
      targetLayer.locked = locked;
    }
    // console.log(this.gameMapLayersInfo);
  }

  getCurrentLayerId() {
    const layer = this.gameMapLayersInfo.find((l) => l.selected);
    return layer?.id || 0;
  }

  findTextureIdFromLayer(layerId: number, x: number, y: number) {
    const layer = this.gameMapLayersInfo.find((l) => l.id === layerId);
    if (!layer) return 0;
    const { grid } = layer;
    const isValid = this.isRowCellExist;
    if (isValid(grid[y]) && isValid(grid[y][x])) {
      return grid[y][x];
    }
    return 0;
  }

  findTextureIdsFromLayers(x: number, y: number) {
    const legends: TileLegend[] = [];
    const layers = this.gameMapLayersInfo;
    const isValid = this.isRowCellExist;
    layers.forEach(({ grid, selected }) => {
      if (isValid(grid[y]) && isValid(grid[y][x])) {
        legends.push({
          textureId: grid[y][x],
          active: selected,
        });
      } else {
        legends.push({
          textureId: 0,
          active: selected,
        });
      }
    });
    return legends;
  }

  clearTilesInCurrentLayer() {
    const currentLayerId = this.getCurrentLayerId();
    return this.removeSpritesByLayerId(currentLayerId);
  }

  removeSpritesByLayerId(layerId: number) {
    // clear tile id in layer
    const layer = this.gameMapLayersInfo.find((l) => l.id === layerId);
    if (!layer) {
      console.warn('No layer found!');
      return;
    }
    layer.grid.forEach((row) => row.fill(0));
    // clear cache
    const target: string[] = [];
    const tiles: SpriteX[] = [];
    this.paintedTilesCache.forEach((tile, key) => {
      if (tile.getLayerId() === layerId) {
        target.push(key);
        tiles.push(tile);
      }
    });
    target.forEach((key) => {
      this.paintedTilesCache.delete(key);
    });
    return tiles;
  }

  scaleAllTiles(grid: Rectangle[][]) {
    this.paintedTilesCache.forEach((tile, key) => {
      // x: column, y: row
      const [, x, y] = key.split('_');
      const rect = grid[+y - 1][+x - 1];
      tile.x = rect.x;
      tile.y = rect.y;
      tile.width = rect.width;
      tile.height = rect.height;
    });
  }

  /**
   * delete all the layers and sprites cache
   */
  cleanup() {
    this.gameMapLayersInfo.length = 0;
    this.paintedTilesCache.clear();
    this.addNewLayer(1, 'Layer - 1');
  }

  clear() {
    this.paintedTilesCache.clear();
  }

  /**
   * rest zIndex of each sprite rendering level
   * after adjustment of layer order
   */
  protected syncSpriteZindexWithLayer() {
    this.gameMapLayersInfo.forEach((l) => {
      const sprites = this.getSpritesByLayerId(l.id);
      sprites.forEach((tile) => {
        tile.zIndex = l.zIndex;
      });
    });
  }

  /**
   * @param layerId
   * @returns
   */
  protected getSpritesByLayerId(layerId: number) {
    const result: SpriteX[] = [];
    this.paintedTilesCache.forEach((tile, key) => {
      if (tile.getLayerId() === layerId) {
        result.push(tile);
      }
    });
    return result;
  }

  protected createNewLayer(id: number, name: string) {
    // empty grid to hold texture ids
    const grid = this.makeEmptyMapLayerGrid(this.mapWidth, this.mapHeight);
    // console.log(grid);
    // build one layer data as default one
    const layer: GameWeaverLayer = {
      id,
      name,
      width: this.mapWidth,
      height: this.mapHeight,
      grid,
      selected: true,
      visible: true,
      locked: false,
      zIndex: id,
    };
    this.gameMapLayersInfo.push(layer);
  }

  protected selectGameLayer(id: number) {
    // deselect all first
    this.gameMapLayersInfo.forEach((l) => {
      l.selected = false;
    });
    // select the one
    const layer = this.gameMapLayersInfo.find((l) => l.id === id);
    if (layer) {
      layer.selected = true;
    }
  }

  protected makeEmptyMapLayerGrid(mapWidth: number, mapHeight: number) {
    const grid = new Array(mapHeight).fill(0);
    return grid.map(() => new Array(mapWidth).fill(0));
  }

  protected isRowCellExist(id: LayerTextureType) {
    return typeof id !== 'undefined';
  }

  /**
   * @deprecated
   * FIXME: rebuild game data structure ...
   * @param grid
   * @returns
   */
  protected mergeLayerTexturesFromSession(grid: number[][]) {
    // check layer existence in session
    const isLayerPainted = getSessionBy('layerPainted') as boolean;
    if (!isLayerPainted) return;
    // prepare to rebuild layer from session ...
    const columnSize = getSessionBy('columnSize') as number;
    const flatLayer = getSessionBy('layer_1') as number[];
    const oldLayerGrid = this.rebuildGridFromFlat(flatLayer, columnSize);
    const isValid = this.isRowCellExist;
    // need to merge two layers
    for (let i = 0; i < oldLayerGrid.length; i += 1) {
      const row = oldLayerGrid[i];
      for (let j = 0; j < row.length; j += 1) {
        if (isValid(grid[i]) && isValid(grid[i][j])) {
          grid[i][j] = row[j]; // value reset from old layer
        }
      }
    }
  }

  protected rebuildGridFromFlat(
    flatGrid: number[],
    columnSize: number
  ): number[][] {
    if (columnSize === 0 || !flatGrid || !flatGrid.length) return [];
    const grid = [];
    const rowSize = flatGrid.length / columnSize;
    for (let i = 0; i < rowSize; i += 1) {
      grid.push(flatGrid.slice(i * columnSize, (i + 1) * columnSize));
    }
    return grid;
  }
}
