/**
 * Created at 2022/10/16
 */

import * as PIXI from 'pixi.js';

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

  protected isEmptyRect(hitRect: PIXI.Rectangle): boolean {
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

  /**
   * figure out the hit rect position(col, row) in tile grid.
   *
   * NOTE: col, row value both start from 1 instead of 0!
   * @param rect
   * @param grid
   * @returns [columnIndex, rowIndex]
   */
  protected findCoordinateFromTileGrid(
    rect: PIXI.Rectangle,
    grid: PIXI.Rectangle[][]
  ): number[] {
    // outside of grid by default!
    const coordinate = [0, 0];
    for (let i = 0; i < grid.length; i += 1) {
      const row = grid[i];
      for (let j = 0; j < row.length; j += 1) {
        const cell = row[j];
        if (rectEquals(rect, cell)) {
          coordinate[0] = j + 1; // x, columnIndex
          coordinate[1] = i + 1; // y, rowIndex
        }
      }
    }
    return coordinate;
  }

  /**
   * find out the cell by column and row index
   * @param x column
   * @param y row
   * @param grid
   * @returns
   */
  protected findRectangleFromGrid(
    x: number,
    y: number,
    grid: PIXI.Rectangle[][]
  ) {
    return grid[y][x];
  }

  protected makeEmptyMapLayerGrid(mapWidth: number, mapHeight: number) {
    const grid = new Array(mapHeight).fill(0);
    return grid.map(() => new Array(mapWidth).fill(0));
  }

  // more method ....
}
