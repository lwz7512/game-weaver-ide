import { useState } from 'react';

export type MapLayer = {
  id: string;
  name: string;
  selected: boolean;
  editMode: boolean;
};

const mockLayers: MapLayer[] = [
  {
    id: '1',
    name: 'Layer - 1',
    selected: false,
    editMode: false,
  },
  {
    id: '2',
    name: 'Layer - 2',
    selected: false,
    editMode: false,
  },
  {
    id: '3',
    name: 'Layer - 3',
    selected: false,
    editMode: false,
  },
  {
    id: '4',
    name: 'Layer - 4',
    selected: false,
    editMode: false,
  },
  {
    id: '5',
    name: 'Layer - 5',
    selected: false,
    editMode: false,
  },
  {
    id: '6',
    name: 'Layer - 6',
    selected: false,
    editMode: false,
  },
  {
    id: '7',
    name: 'Layer - 7',
    selected: false,
    editMode: false,
  },
  {
    id: '8',
    name: 'Layer - 8',
    selected: false,
    editMode: false,
  },
];

export const useMapLayers = () => {
  const [layers, setLayers] = useState<MapLayer[]>(mockLayers);

  const selectLayerHandler = (id: string) => {
    const currentLayers = layers.map((l) => {
      l.selected = false;
      if (l.id === id) {
        l.selected = true;
      }
      return l;
    });
    setLayers(currentLayers);
  };

  const layerNameChangeHandler = (id: string, value: string) => {
    const updatedLayers = layers.map((l) => {
      if (l.id === id) return { ...l, name: value, selected: true };
      return l;
    });
    setLayers(updatedLayers);
  };

  return {
    layers,
    selectLayerHandler,
    layerNameChangeHandler,
  };
};
