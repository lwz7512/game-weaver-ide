/**
 * Created at 2022/10/16
 */

import * as PIXI from 'pixi.js';

import bunnyImage from '../assets/bunny.png';

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

  protected setupText(app: PIXI.Application) {
    this.basicText = new PIXI.Text('Basic text in pixi');
    this.basicText.x = 50;
    this.basicText.y = 100;
    app.stage.addChild(this.basicText);
  }

  protected updateText(msg: string) {
    if (this.basicText) {
      this.basicText.text = msg;
    }
  }

  protected basicDemo(app: PIXI.Application) {
    const container = new PIXI.Container();

    app.stage.addChild(container);

    // Create a new texture
    const texture = PIXI.Texture.from(bunnyImage);

    // Create a 5x5 grid of bunnies
    for (let i = 0; i < 25; i += 1) {
      const bunny = new PIXI.Sprite(texture);
      bunny.anchor.set(0.5);
      bunny.x = (i % 5) * 40;
      bunny.y = Math.floor(i / 5) * 40;
      container.addChild(bunny);
    }

    // Move container to the center
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;

    // Center bunny sprite in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    // Listen for animate update
    app.ticker.add((delta) => {
      // rotate the container!
      // use delta to create frame-independent transform
      container.rotation -= 0.01 * delta;
    });
  }

  // ================ click demo ========================
  protected clickDemo(app: PIXI.Application) {
    // Scale mode for all textures, will retain pixelation
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    const sprite = PIXI.Sprite.from(bunnyImage);

    // Set the initial position
    sprite.anchor.set(0.5);
    sprite.x = app.screen.width / 2;
    sprite.y = app.screen.height / 5;

    // Opt-in to interactivity
    sprite.interactive = true;

    // Shows hand cursor
    sprite.buttonMode = true;

    function onClick() {
      sprite.scale.x *= 1.25;
      sprite.scale.y *= 1.25;
    }
    // Pointers normalize touch and mouse
    sprite.on('pointerdown', onClick);

    app.stage.addChild(sprite);
  }
}
