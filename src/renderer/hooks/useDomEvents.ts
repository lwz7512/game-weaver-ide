import React, { useEffect } from 'react';

import { TiledPainter } from '../tiled/Painter';
import { GWEvent } from '../tiled/Events';

type EditorRef = React.MutableRefObject<TiledPainter | null>;

export const useDomEvents = (editorRef: EditorRef) => {
  useEffect(() => {
    const getEditor = () => editorRef.current;

    const newLayerHandler = (event: Event) => {
      const { detail } = event as CustomEvent;
      getEditor()?.addNewLayer(detail.id, detail.name);
    };
    const deleteLayerHandler = (event: Event) => {
      const { detail } = event as CustomEvent;
      getEditor()?.deleteLayer(detail);
    };
    const nameChangeHandler = (event: Event) => {
      const { detail } = event as CustomEvent;
      getEditor()?.renameLayer(detail.id, detail.name);
    };
    const layerSelectHandler = (event: Event) => {
      const { detail } = event as CustomEvent;
      getEditor()?.selectLayer(detail);
    };
    const moveLayerUpHandler = () => {
      getEditor()?.moveSelectedLayerUp();
    };
    const moveLayerDownHandler = () => {
      getEditor()?.moveSelectedLayerDown();
    };

    document.addEventListener(GWEvent.NEWLAYER, newLayerHandler);
    document.addEventListener(GWEvent.DELETELAYER, deleteLayerHandler);
    document.addEventListener(GWEvent.RENAMELAYER, nameChangeHandler);
    document.addEventListener(GWEvent.SELECTLAYER, layerSelectHandler);
    document.addEventListener(GWEvent.MOVEUPLAYER, moveLayerUpHandler);
    document.addEventListener(GWEvent.MOVEDOWNLAYER, moveLayerDownHandler);

    return () => {
      document.removeEventListener(GWEvent.NEWLAYER, newLayerHandler);
      document.removeEventListener(GWEvent.DELETELAYER, deleteLayerHandler);
      document.removeEventListener(GWEvent.RENAMELAYER, nameChangeHandler);
      document.removeEventListener(GWEvent.SELECTLAYER, layerSelectHandler);
      document.removeEventListener(GWEvent.MOVEUPLAYER, moveLayerUpHandler);
      document.removeEventListener(GWEvent.MOVEDOWNLAYER, moveLayerDownHandler);
      console.log(`cleanup dom events!`);
    };
  }, [editorRef]);
};
