import { useState, useEffect, useRef } from 'react';

import { TiledCore } from '../tiled/Core';
import { setDrawingSession, getDrawingSession } from '../state/session';

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
  const editorRef = useRef<TiledCore | null>(null);

  useEffect(() => {
    const selector = '.tiled-editor-root';
    const root = document.querySelector(selector) as HTMLElement;

    const relayoutEditor = (entries: ResizeObserverEntry[]) => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }

      const { width, height } = root.getBoundingClientRect();
      const editor = new TiledCore(root, width, height);
      editorRef.current = editor; // save the app instance

      const session = getDrawingSession();
      editor.resetSession(session);
      editor.create();
      // now start draw
      editor.setGameDimension(mapWidth, mapHeight, tileWidth, tileHeight);
      editor.drawMapGrid();
      // listen editor change
      editor.addEventListener('session', (event: Event) => {
        const customEvt = event as CustomEvent;
        // save the session
        const newSession = { ...session, ...customEvt.detail };
        setDrawingSession(newSession);
      });
      // console.log('>>> recreate editor...');
    };

    const observer = new ResizeObserver(relayoutEditor);
    observer.observe(root);

    () => {
      (editorRef.current as TiledCore).destroy();
      editorRef.current = null; // clear the instance
      observer.unobserve(root);
    };
  }, [mapWidth, mapHeight, tileWidth, tileHeight]);

  const zoomInHandler = () => {
    editorRef.current && editorRef.current.zoomIn();
  };

  const zoomOutHandler = () => {
    editorRef.current && editorRef.current.zoomOut();
  };

  return {
    zoomInHandler,
    zoomOutHandler,
  };
  // ...
};
