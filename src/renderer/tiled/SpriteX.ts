import { Sprite, Texture } from 'pixi.js';

export class SpriteX extends Sprite {
  protected layerId = 0;
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
    this.name = colRow;
  }

  public getUniqueKey() {
    return this.key;
  }

  public getLayerId() {
    return this.layerId;
  }

  get globalKey() {
    return `${this.layerId}_${this.key}`;
  }

  set layer(id: number) {
    this.layerId = id;
  }

  get layer() {
    return this.layerId;
  }
}
