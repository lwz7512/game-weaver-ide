import { useEffect, useRef, useState } from 'react';

import { TiledPainter } from '../tiled/Painter';
import { getDrawingSession } from '../state/session';

/**
 * Core tiled editor interaction with page UI
 * Create @2022/10/17
 *
 * @param mapWidth
 * @param mapHeight
 * @param tileWidth
 * @param tileHeight
 * @returns
 */
export const useTiledEditor = (
  mapWidth: number,
  mapHeight: number,
  tileWidth: number,
  tileHeight: number,
  selectedImage: string
) => {
  const editorRef = useRef<TiledPainter | null>(null);
  const [eraseToolSelected, setEraseToolSelected] = useState(false);
  const [translateSelected, setTranslateSelected] = useState(false);

  /**
   * construct editor
   */
  useEffect(() => {
    const relayoutEditor = (entries: ResizeObserverEntry[]) => {
      if (editorRef.current) {
        // === reset app while window resizing ===
        const { width: bw, height: bh } = entries[0].contentRect;
        const editor = editorRef.current;
        // 298 = left module bar width 56px + right panel width 240px + 2px
        editor.layout(mapWidth, mapHeight, tileWidth, tileHeight);
        editor.resetApp(bw - 298, bh);
        return;
      }
      const selector = '.tiled-editor-root';
      const root = document.querySelector(selector) as HTMLElement;
      const { width, height } = root.getBoundingClientRect();
      const editor = new TiledPainter(root, width, height);
      editorRef.current = editor; // save the app instance
      // console.log(`## editor created!`);
      const session = getDrawingSession();
      editor.create(session);
      // now start draw
      editor.layout(mapWidth, mapHeight, tileWidth, tileHeight);
      // paint from cached layer info
      editor.paintMapLayer(session);
      // reset tile grid
      editor.resetTileSize(selectedImage);
    };
    // FIXME: observing body is the right way to respond to devtool toggling
    // @2022/11/04
    const body = document.querySelector('body') as HTMLElement;
    const observer = new ResizeObserver(relayoutEditor);
    observer.observe(body);

    // restore the tool states
    setEraseToolSelected(false);
    setTranslateSelected(false);

    return () => {
      console.log(`#### destroy editor while main params chagned ###`);
      observer.unobserve(body);
      editorRef.current && editorRef.current.destroy();
      editorRef.current = null; // clear the instance
    };
  }, [mapWidth, mapHeight, tileWidth, tileHeight, selectedImage]);

  const zoomInHandler = () => {
    editorRef.current?.zoomIn();
  };

  const zoomOutHandler = () => {
    editorRef.current?.zoomOut();
  };

  const zoomToRealSize = () => {
    editorRef.current?.zoomToRealSize();
  };

  const eraseTilesHandler = () => {
    setEraseToolSelected(!eraseToolSelected);
    // save erase mode to editor
    editorRef.current?.setEraseMode(!eraseToolSelected);
  };

  const translateMapHandler = () => {
    setTranslateSelected(!translateSelected);
    editorRef.current?.setTranslateMode(!translateSelected);
  };

  const eraseTilesFromLayer = () => {
    editorRef.current?.eraseTileInCurrentLayer();
  };

  return {
    editorRef,
    eraseToolSelected,
    translateSelected,
    zoomInHandler,
    zoomOutHandler,
    zoomToRealSize,
    eraseTilesHandler,
    translateMapHandler,
    eraseTilesFromLayer,
  };
  // end of hook ...
};
