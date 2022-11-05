import { useState, useEffect, useRef } from 'react';

import { TiledCore } from '../tiled/Core';
import { GWEvent } from '../tiled/Events';
import { setDrawingSession, getDrawingSession } from '../state/session';
import { getTileSheetBy } from './useSpriteSheetImage';

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

  /**
   * construct editor
   */
  useEffect(() => {
    const relayoutEditor = (entries: ResizeObserverEntry[]) => {
      if (editorRef.current) {
        const { width: bw, height: bh } = entries[0].contentRect;
        editorRef.current.resetApp(bw - 298, bh);
        return;
      }
      const selector = '.tiled-editor-root';
      const root = document.querySelector(selector) as HTMLElement;
      const { width, height } = root.getBoundingClientRect();
      const editor = new TiledCore(root, width, height);
      editorRef.current = editor; // save the app instance

      const session = getDrawingSession();
      editor.create(session);
      // now start draw
      editor.layout(mapWidth, mapHeight, tileWidth, tileHeight);
      // listen editor change
      // add more session data to keep the editor status including tiles...
      editor.addEventListener('session', (event: Event) => {
        const customEvt = event as CustomEvent;
        // save the session
        const newSession = { ...session, ...customEvt.detail };
        setDrawingSession(newSession);
      });
      // console.log('>>> recreate editor...');
    };
    // FIXME: observing body is the right way to respond to devtool toggling
    // @2022/11/04
    const body = document.querySelector('body') as HTMLElement;
    const observer = new ResizeObserver(relayoutEditor);
    observer.observe(body);

    () => {
      (editorRef.current as TiledCore).destroy();
      editorRef.current = null; // clear the instance
      observer.unobserve(body);
      console.log('>>>> tiled editer destroy ...');
    };
  }, [mapWidth, mapHeight, tileWidth, tileHeight]);

  /**
   * draw tiles from tile sheet image
   */
  useEffect(() => {
    const selectedImageChangeHandler = (evt: Event) => {
      const customEvt = evt as CustomEvent;
      const selectedImage = customEvt.detail;
      const { textures } = getTileSheetBy(selectedImage);
      const editor = editorRef.current as TiledCore;
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
    editorRef.current && editorRef.current.zoomIn();
  };

  const zoomOutHandler = () => {
    editorRef.current && editorRef.current.zoomOut();
  };

  return {
    editorRef,
    zoomInHandler,
    zoomOutHandler,
  };
  // ...
};
