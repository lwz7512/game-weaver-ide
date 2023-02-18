import { Point } from 'pixi.js';

/**
 * Represent the left-top corner of tile map grid cell
 */
export class PointX extends Point {
  protected tileId = 0;

  /**
   * set tile id used in this cell
   */
  setTileId(id: number) {
    this.tileId = id;
  }

  getTileId() {
    return this.tileId;
  }

  /**
   * set tile id used in this cell
   */
  set tile(id: number) {
    this.tileId = id;
  }

  /**
   * get tile id used in this cell
   */
  get tile() {
    return this.tileId;
  }
}
