import { useEffect, useRef, useState } from 'react';

import { TiledPainter } from '../tiled/Painter';
import { GWEvent } from '../tiled/Events';
import { setDrawingSession, getDrawingSession } from '../state/session';
import { getTileSheetBy } from '../state/cache';

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
  tileHeight: number
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
        const { width: bw, height: bh } = entries[0].contentRect;
        const editor = editorRef.current;
        // 298 = left module bar width 56px + right panel width 240px + 2px
        editor.resetApp(bw - 298, bh);
        editor.layout(mapWidth, mapHeight, tileWidth, tileHeight);
        return;
      }
      const selector = '.tiled-editor-root';
      const root = document.querySelector(selector) as HTMLElement;
      const { width, height } = root.getBoundingClientRect();
      const editor = new TiledPainter(root, width, height);
      editorRef.current = editor; // save the app instance

      const session = getDrawingSession();
      editor.create(session);
      // now start draw
      editor.layout(mapWidth, mapHeight, tileWidth, tileHeight);
      // paint from cached layer info
      editor.paintMapLayer(session);
      // listen editor change
      // add more session data to keep the editor status including tiles...
      editor.addEventListener('session', (event: Event) => {
        const customEvt = event as CustomEvent;
        // save the session
        const newSession = { ...session, ...customEvt.detail };
        setDrawingSession(newSession);
      });
    };
    // FIXME: observing body is the right way to respond to devtool toggling
    // @2022/11/04
    const body = document.querySelector('body') as HTMLElement;
    const observer = new ResizeObserver(relayoutEditor);
    observer.observe(body);

    () => {
      (editorRef.current as TiledPainter).destroy();
      editorRef.current = null; // clear the instance
      observer.unobserve(body);
    };
  }, [mapWidth, mapHeight, tileWidth, tileHeight]);

  /**
   * draw tiles from tile sheet image, driven by `useSelectedTileSheet`
   */
  useEffect(() => {
    const selectedImageChangeHandler = (evt: Event) => {
      const customEvt = evt as CustomEvent;
      const selectedImage = customEvt.detail;
      const { textures } = getTileSheetBy(selectedImage);
      const editor = editorRef.current as TiledPainter;
      editor.drawTilePicker(tileWidth, tileHeight, textures);
    };

    document.addEventListener(
      GWEvent.SELECTEDIMAGE,
      selectedImageChangeHandler
    );

    return () => {
      document.removeEventListener(
        GWEvent.SELECTEDIMAGE,
        selectedImageChangeHandler
      );
    };
  }, [tileWidth, tileHeight]);

  const zoomInHandler = () => {
    editorRef.current?.zoomIn();
  };

  const zoomOutHandler = () => {
    editorRef.current?.zoomOut();
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

  return {
    editorRef,
    eraseToolSelected,
    translateSelected,
    zoomInHandler,
    zoomOutHandler,
    eraseTilesHandler,
    translateMapHandler,
  };
  // end of hook ...
};
