/**
 * Created at 2022/10/16
 */

import * as PIXI from 'pixi.js';

import bunnyImage from '../assets/bunny.png';

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

export class BaseEditor extends EventTarget {
  protected basicText: PIXI.Text | null = null;

  // hold some basic method ...

  checkIsNotEmptyRect(hitRect: PIXI.Rectangle): boolean {
    return !rectEquals(hitRect, PIXI.Rectangle.EMPTY);
  }

  checkIsEmptyRect(hitRect: PIXI.Rectangle): boolean {
    return rectEquals(hitRect, PIXI.Rectangle.EMPTY);
  }

  isTouchedGrid(pt: PIXI.Point, grid: PIXI.Rectangle[][]) {
    const rect = this.containInGrid(pt, grid);
    return this.checkIsNotEmptyRect(rect);
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

  findCoordinateFromTileGrid(
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

  makeEmptyMapLayerGrid(mapWidth: number, mapHeight: number) {
    const grid = new Array(mapHeight);
    return grid.map(() => new Array(mapWidth).fill(0));
  }

  flattenGrid(grid: number[][]): number[] {
    return grid.reduce((prev: number[], row: number[]) => {
      return prev.concat(...row);
    }, []);
  }

  rebuildGridFromFlat(flatGrid: number[], columnSize: number): number[][] {
    if (columnSize === 0) return [];
    const grid = [];
    const rowSize = flatGrid.length / columnSize;
    for (let i = 0; i < rowSize; i += 1) {
      grid.push(flatGrid.slice(i * columnSize, (i + 1) * columnSize));
    }
    return grid;
  }

  // more method ....
}
