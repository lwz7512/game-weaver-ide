/**
 * Created at 2022/10/10
 */

import { extensions, InteractionManager, Renderer } from 'pixi.js';
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
  const {
    zoomInHandler,
    zoomOutHandler,
    eraseTilesHandler,
    eraseToolSelected,
  } = useTiledEditor(mapWidth, mapHeight, tileWidth, tileHeight);

  return (
    <div className="tiled-editor-root flex-1 h-full bg-gray-300 relative">
      {/* empty content to hold pixi application canvas */}
      {/* vertical tool bar */}
      <div className="absolute top-4 right-4 w-6 h-64 ">
        <IconToolButton
          mini
          icon="zoom-in"
          iconSize={16}
          title="Zoom In Map"
          onClick={zoomInHandler}
        />
        <IconToolButton
          mini
          icon="zoom-out"
          iconSize={16}
          title="Zoom Out Map"
          onClick={zoomOutHandler}
        />
        <IconToolButton
          mini
          icon="eraser"
          iconSize={16}
          title="Erase tiles"
          selected={eraseToolSelected}
          onClick={eraseTilesHandler}
        />
        <IconToolButton
          mini
          icon="help"
          iconSize={16}
          title="How to..."
          onClick={() => null}
        />
      </div>
    </div>
  );
};
