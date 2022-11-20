/**
 * Created at 2022/10/16
 */

import * as PIXI from 'pixi.js';

import { getSessionBy } from '../state/session';

export type GameTilesLayer = {
  id?: number;
  x?: number;
  y?: number;
  name?: string;
  height: number; // vertical tiles amount
  width: number; // horizontal tiles amount
  opacity?: number;
  type?: string;
  visible?: boolean;
  grid: number[][]; // hold painted tile id
};

export const rectEquals = (
  one: PIXI.Rectangle,
  other: PIXI.Rectangle
): boolean => {
  const fix2digit = (n: number) => +n.toFixed(2);
  return (
    other &&
    fix2digit(one.x) === fix2digit(other.x) &&
    fix2digit(one.y) === fix2digit(other.y) &&
    fix2digit(one.width) === fix2digit(other.width) &&
    fix2digit(one.height) === fix2digit(other.height)
  );
};

type LayerTextureType = number[] | number | undefined;

/**
 * ================= Base Editor Class =========================
 * to do trivial stuff
 * =============================================================
 */
export class BaseEditor extends EventTarget {
  protected basicText: PIXI.Text | null = null;

  protected checkIsNotEmptyRect(hitRect: PIXI.Rectangle): boolean {
    return !rectEquals(hitRect, PIXI.Rectangle.EMPTY);
  }

  protected checkIsEmptyRect(hitRect: PIXI.Rectangle): boolean {
    return rectEquals(hitRect, PIXI.Rectangle.EMPTY);
  }

  protected isTouchedGrid(pt: PIXI.Point, grid: PIXI.Rectangle[][]) {
    const rect = this.containInGrid(pt, grid);
    return this.checkIsNotEmptyRect(rect);
  }

  protected containInGrid(
    pt: PIXI.Point,
    grid: PIXI.Rectangle[][]
  ): PIXI.Rectangle {
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

  protected findCoordinateFromTileGrid(
    rect: PIXI.Rectangle,
    grid: PIXI.Rectangle[][]
  ): number[] {
    const coordinate = [0, 0];
    for (let i = 0; i < grid.length; i += 1) {
      const row = grid[i];
      for (let j = 0; j < row.length; j += 1) {
        const cell = row[j];
        if (rectEquals(rect, cell)) {
          coordinate[0] = j; // x
          coordinate[1] = i; // y
        }
      }
    }
    return coordinate;
  }

  protected makeEmptyMapLayerGrid(mapWidth: number, mapHeight: number) {
    const grid = new Array(mapHeight).fill(0);
    return grid.map(() => new Array(mapWidth).fill(0));
  }

  flattenGrid(grid: number[][]): number[] {
    return grid.reduce((prev: number[], row: number[]) => {
      return prev.concat(...row);
    }, []);
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

  protected isRowCellExist(id: LayerTextureType) {
    return typeof id !== 'undefined';
  }

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

  // more method ....
}
