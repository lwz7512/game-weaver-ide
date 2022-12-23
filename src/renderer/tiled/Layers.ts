import { Sprite, Texture } from 'pixi.js';
import { GameTilesLayer } from './Base';
import { SpriteX } from './SpriteX';
import { getSessionBy } from '../state/session';

type LayerTextureType = number[] | number | undefined;

export class LayerManager {
  protected mapWidth = 0;
  protected mapHeight = 0;
  protected gameMapLayersInfo: GameTilesLayer[] = [];

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
    // save texuture id to grid
    layer.grid[row][col] = tileId;
    const key = `${layerId}_${col}_${row}`;
    tile && this.paintedTilesCache.set(key, tile);
    return layer;
  }

  clearOneTile(layerId: number, col: number, row: number) {
    // TODO: ...
  }

  lockLayer(id: number) {
    // TODO: ...
  }

  hideLayer(id: number) {
    // TODO: ...
  }

  addNewLayer(id: number, name: string) {
    this.createNewLayer(id, name);
    this.selectGameLayer(id);
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
    // console.log(this.gameMapLayersInfo);
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
    layers[selectedIndex - 1] = layers[selectedIndex];
    layers[selectedIndex] = prevLayer;
  }

  moveSelectedLayerDown() {
    const layers = this.gameMapLayersInfo;
    const selectedIndex = layers.findIndex((l) => l.selected);
    if (selectedIndex === layers.length - 1) return; // end of layers
    const nextLayer = layers[selectedIndex + 1];
    layers[selectedIndex + 1] = layers[selectedIndex];
    layers[selectedIndex] = nextLayer;
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

  /**
   * rest zIndex of each sprite rendering level
   */
  protected resetTileRenderIndex() {
    // TODO: ...
  }

  protected createNewLayer(id: number, name: string) {
    // empty grid to hold texture ids
    const grid = this.makeEmptyMapLayerGrid(this.mapWidth, this.mapHeight);
    // trying to merge old layer
    // this.mergeLayerTexturesFromSession(grid);
    // build one layer data as default one
    const layer: GameTilesLayer = {
      id,
      name,
      width: this.mapWidth,
      height: this.mapHeight,
      grid,
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
