/**
 * Created at 2022/10/10
 */

import { extensions, InteractionManager } from 'pixi.js';
import { ShaderSystem } from '@pixi/core';
import { install } from '@pixi/unsafe-eval'; // FIXME: THIS IS NECESSARY!

import { IconToolButton } from '../components/Buttons';
import { useTiledEditor } from '../hooks/useTiledEditor';

// Apply the patch to PIXI
install({ ShaderSystem });
extensions.remove(InteractionManager);

type EditorProps = {
  mapWidth: number; // hori-tile-size
  mapHeight: number; // vert-tile-size
  tileWidth: number; // width in pixel
  tileHeight: number; // height in pixel
};

export const TiledEditor = ({
  mapWidth,
  mapHeight,
  tileWidth,
  tileHeight,
}: EditorProps) => {
  const { zoomInHandler, zoomOutHandler } = useTiledEditor(
    mapWidth,
    mapHeight,
    tileWidth,
    tileHeight
  );

  return (
    <div className="tiled-editor-root w-full h-full bg-black relative">
      {/* empty content to hold pixi application canvas */}
      <div className="absolute top-4 right-4 w-6 h-14">
        <IconToolButton
          mini
          icon="zoom-in"
          iconSize={16}
          onClick={zoomInHandler}
        />
        <IconToolButton
          mini
          icon="zoom-out"
          iconSize={16}
          onClick={zoomOutHandler}
        />
      </div>
    </div>
  );
};
