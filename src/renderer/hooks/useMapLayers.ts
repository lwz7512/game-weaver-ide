import { useState } from 'react';
import { GWEvent } from '../tiled/Events';

export type MapLayer = {
  id: number;
  name: string;
  selected: boolean;
  editMode: boolean;
};

export const useMapLayers = () => {
  const initLayers: MapLayer[] = [
    {
      id: 1,
      name: 'Layer - 1',
      selected: true,
      editMode: false,
    },
  ];
  const [layers, setLayers] = useState<MapLayer[]>(initLayers);

  const selectLayerHandler = (id: number) => {
    const currentLayers = layers.map((l) => {
      l.selected = false;
      if (l.id === id) l.selected = true;
      return l;
    });
    setLayers(currentLayers);
    document.dispatchEvent(
      new CustomEvent(GWEvent.SELECTLAYER, { detail: id })
    );
  };

  const layerNameChangeHandler = (id: number, value: string) => {
    const updatedLayers = layers.map((l) => {
      if (l.id === id) return { ...l, name: value, selected: true };
      return l;
    });
    setLayers(updatedLayers);
    const detail = { id, name: value };
    document.dispatchEvent(new CustomEvent(GWEvent.RENAMELAYER, { detail }));
  };

  const addNewLayer = () => {
    const lastLayerId = layers.slice(-1)[0].id;
    const newLayerId = +lastLayerId + 1;
    const newLayerName = `Layer - ${newLayerId}`;
    layers.forEach((l) => {
      l.selected = false;
    });
    const newLayers = [...layers].concat({
      id: newLayerId,
      name: newLayerName,
      selected: true,
      editMode: false,
    });
    setLayers(newLayers);
    const detail = { id: newLayerId, name: newLayerName };
    document.dispatchEvent(new CustomEvent(GWEvent.NEWLAYER, { detail }));
  };

  const deleteCurrentLayer = () => {
    if (layers.length === 1) return;
    const selectedLayer = layers.find((l) => l.selected);
    const nextIndex = layers.findIndex((l) => l.selected);
    const tempLayers = layers.filter((l) => !l.selected);
    if (tempLayers[nextIndex]) {
      tempLayers[nextIndex].selected = true;
    } else {
      tempLayers[0].selected = true;
    }
    setLayers(tempLayers);
    selectedLayer &&
      document.dispatchEvent(
        new CustomEvent(GWEvent.DELETELAYER, { detail: selectedLayer.id })
      );
  };

  const moveLayerUp = () => {
    const selectedIndex = layers.findIndex((l) => l.selected);
    if (selectedIndex === 0) return; // start of layers

    const prevLayer = layers[selectedIndex - 1];
    const tempLayers = [...layers];
    tempLayers[selectedIndex - 1] = layers[selectedIndex];
    tempLayers[selectedIndex] = prevLayer;
    setLayers(tempLayers);
    document.dispatchEvent(new CustomEvent(GWEvent.MOVEUPLAYER));
  };

  const moveLayerDown = () => {
    const selectedIndex = layers.findIndex((l) => l.selected);
    if (selectedIndex === layers.length - 1) return; // bottom of layers

    const nextLayer = layers[selectedIndex + 1];
    const tempLayers = [...layers];
    tempLayers[selectedIndex + 1] = layers[selectedIndex];
    tempLayers[selectedIndex] = nextLayer;
    setLayers(tempLayers);
    document.dispatchEvent(new CustomEvent(GWEvent.MOVEDOWNLAYER));
  };

  return {
    layers,
    selectLayerHandler,
    layerNameChangeHandler,
    addNewLayer,
    deleteCurrentLayer,
    moveLayerUp,
    moveLayerDown,
  };
};
