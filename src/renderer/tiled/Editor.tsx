/**
 * Created at 2022/10/10
 */
import { useEffect } from 'react';
import { extensions, InteractionManager, Renderer } from 'pixi.js';
import { ShaderSystem } from '@pixi/core';
import { install } from '@pixi/unsafe-eval'; // FIXME: THIS IS NECESSARY!

import { IconToolButton } from '../components/Buttons';
import { useTiledEditor } from '../hooks/useTiledEditor';
import { useDomEvents } from '../hooks/useDomEvents';
import { TiledPainter } from './Painter';

// Apply the patch to PIXI
install({ ShaderSystem });
extensions.remove(InteractionManager);

type EditorProps = {
  mapWidth: number; // hori-tile-size
  mapHeight: number; // vert-tile-size
  tileWidth: number; // width in pixel
  tileHeight: number; // height in pixel
  /** local tilesheet image URL locally */
  selectedImage: string;
  editorInstanceSaver: (editor: TiledPainter | null) => void;
};

export const TiledEditor = ({
  mapWidth,
  mapHeight,
  tileWidth,
  tileHeight,
  selectedImage,
  editorInstanceSaver,
}: EditorProps) => {
  const {
    editorRef,
    eraseToolSelected,
    translateSelected,
    zoomInHandler,
    zoomOutHandler,
    zoomToRealSize,
    eraseTilesHandler,
    translateMapHandler,
    eraseTilesFromLayer,
  } = useTiledEditor(mapWidth, mapHeight, tileWidth, tileHeight, selectedImage);

  // handling events for editor
  useDomEvents(editorRef);

  useEffect(() => {
    editorInstanceSaver(editorRef.current);
  }, [editorInstanceSaver, editorRef]);

  return (
    <div className="tiled-editor-root flex-1 h-full bg-gray-300 relative cursor-pointer">
      {/* empty content to hold pixi application canvas */}
      {/* vertical tool bar */}
      <div className="absolute top-2 right-2 w-6 h-64 ">
        {/* TODO: add flood filling tool */}
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
          icon="zoom-to-fit"
          iconSize={16}
          title="100% Size"
          onClick={zoomToRealSize}
        />
        <IconToolButton
          mini
          icon="move"
          iconSize={16}
          title="Translate Map"
          selected={translateSelected}
          onClick={translateMapHandler}
        />
        <IconToolButton
          mini
          icon="eraser"
          iconSize={16}
          title="Erase tiles one by one"
          selected={eraseToolSelected}
          onClick={eraseTilesHandler}
        />
        <IconToolButton
          mini
          icon="graph-remove"
          iconSize={16}
          title="Erase all tiles in current layer"
          onClick={eraseTilesFromLayer}
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
