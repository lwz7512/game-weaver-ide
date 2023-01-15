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
