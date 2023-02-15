import * as PIXI from 'pixi.js';

/**
 * 2D tile array flatten TO 1D array
 * @param grid game weaver layer 2D array
 * @returns flat array for phaser
 */
export const flattenGrid = (grid: number[][]): number[] => {
  return grid.reduce((prev: number[], row: number[]) => {
    return prev.concat(...row);
  }, []);
};

/**
 * Abstract layer grid to a point list
 * @param grid 2D layer grid
 * @returns
 */
export const gridToPoints = (grid: number[][]): PIXI.Point[] => {
  const points: PIXI.Point[] = [];
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[y].length; x += 1) {
      points.push(new PIXI.Point(x, y));
    }
  }
  return points;
};
