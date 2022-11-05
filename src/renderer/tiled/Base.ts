/**
 * Created at 2022/10/16
 */

import * as PIXI from 'pixi.js';

import bunnyImage from '../assets/bunny.png';

export type GamTilesLayer = {
  id?: number;
  x?: number;
  y?: number;
  name?: string;
  height: number; // vertical tiles amount
  width: number; // horizontal tiles amount
  opacity?: number;
  type?: string;
  visible?: boolean;
  data: number[]; // one layer tile id, array length is width * height
};

export const rectEquals = (
  one: PIXI.Rectangle,
  other: PIXI.Rectangle
): boolean => {
  return (
    other &&
    one.x === other.x &&
    one.y === other.y &&
    one.width === other.width &&
    one.height === other.height
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
          coordinate[1] = i;
          coordinate[0] = j;
        }
      }
    }
    return coordinate;
  }

  // more method ....
}
