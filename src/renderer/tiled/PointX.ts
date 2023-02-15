import { Point } from 'pixi.js';

export class PointX extends Point {
  protected tileId = 0;

  setTileId(id: number) {
    this.tileId = id;
  }

  getTileId() {
    return this.tileId;
  }

  set tile(id: number) {
    this.tileId = id;
  }

  get tile() {
    return this.tileId;
  }
}
