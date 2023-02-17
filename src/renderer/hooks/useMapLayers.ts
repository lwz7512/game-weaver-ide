import { useState, useEffect } from 'react';
import { GWEvent } from '../tiled/Events';
import { GWMap, MapLayer, GameWeaverLayer } from '../tiled';
import { getTilesheetFilePath, getTileSheetBy } from '../state/cache';

export const initLayers: MapLayer[] = [
  {
    id: 1,
    name: 'Layer - 1',
    selected: true,
    editMode: false,
    visible: true,
    unlocked: true,
  },
];

const gwLayersToMapLayers = (gwLayers: GameWeaverLayer[]): MapLayer[] => {
  return gwLayers.map(({ id, name, selected, visible, locked }) => ({
    id,
    name,
    selected,
    editMode: false,
    visible,
    unlocked: !locked,
  }));
};

export const useMapLayers = (
  savedGWMap: GWMap | null,
  selectedImage: string
) => {
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
    const maxLayerId = layers.reduce(
      (prev, l) => (l.id > prev ? l.id : prev),
      0
    );
    const newLayerId = +maxLayerId + 1;
    const newLayerName = `Layer - ${newLayerId}`;
    layers.forEach((l) => {
      l.selected = false;
    });
    const newLayers = [...layers].concat({
      id: newLayerId,
      name: newLayerName,
      selected: true,
      editMode: false,
      visible: true,
      unlocked: true,
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

  const toggleVisibilityHandler = (layerId: number, visible: boolean) => {
    const targetLayer = layers.find((l) => l.id === layerId);
    const evt = new CustomEvent(GWEvent.TOGGLEDISPLAYLAYER, {
      detail: { layerId, visible },
    });
    targetLayer && document.dispatchEvent(evt);
  };

  const toggleAvailabilityHandler = (layerId: number, locked: boolean) => {
    const targetLayer = layers.find((l) => l.id === layerId);
    const evt = new CustomEvent(GWEvent.TOGGLELOCKLAYER, {
      detail: { layerId, locked },
    });
    targetLayer && document.dispatchEvent(evt);
  };

  useEffect(() => {
    if (!savedGWMap) return;

    const tilesheetFilePath = getTilesheetFilePath(selectedImage);
    const { tilesetImage } = savedGWMap;

    // 1. check file path the same, if does not match, reset layers to initial
    if (tilesetImage !== tilesheetFilePath) {
      setLayers(initLayers);
      return;
    }

    // 2. reset game layers
    const simpleLayers = gwLayersToMapLayers(savedGWMap.layers);
    setLayers(simpleLayers);
  }, [savedGWMap, selectedImage]);

  return {
    layers,
    setLayers,
    selectLayerHandler,
    layerNameChangeHandler,
    addNewLayer,
    deleteCurrentLayer,
    moveLayerUp,
    moveLayerDown,
    toggleVisibilityHandler,
    toggleAvailabilityHandler,
  };
};
