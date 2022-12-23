import { Sprite, Texture } from 'pixi.js';

export class SpriteX extends Sprite {
  protected layerId: number;
  protected key: string | undefined;

  constructor(texture: Texture, layerId: number, key?: string) {
    super(texture);
    this.layerId = layerId;
    this.zIndex = layerId;
    if (key) {
      this.key = key;
    }
  }

  public setUniqueKey(colRow: string) {
    this.key = colRow;
  }

  public getLayerId() {
    return this.layerId;
  }

  public moveDown() {
    this.zIndex += 1;
  }

  public moveUp() {
    this.zIndex -= 1;
  }
}
