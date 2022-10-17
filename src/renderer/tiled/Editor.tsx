/**
 * Created at 2022/10/10
 */
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { extensions, InteractionManager } from 'pixi.js';
import { ShaderSystem } from '@pixi/core';

import { install } from '@pixi/unsafe-eval'; // FIXME: THIS IS NECESSARY!
import { TiledCore } from './Core';

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
  const editorRef = useRef<TiledCore | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const selector = '.tiled-editor-root';
      const root = document.querySelector(selector) as HTMLElement;
      const { width, height } = root.getBoundingClientRect();
      const editor = new TiledCore(root, width, height);
      editorRef.current = editor; // save the app instance
    }

    const tiledApp = editorRef.current;

    tiledApp.setGameDimension(mapWidth, mapHeight, tileWidth, tileHeight);
    tiledApp.drawMapGrid();
    console.log('>>> editor inited!');

    () => {
      tiledApp.destroy();
      editorRef.current = null; // clear the instance
    };
  }, [mapWidth, mapHeight, tileWidth, tileHeight]);

  return (
    <div className="tiled-editor-root w-full h-full bg-black">
      {/* empty content to hold pixi application canvas */}
    </div>
  );
};
