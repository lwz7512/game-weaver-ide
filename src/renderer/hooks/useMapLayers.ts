import { useState } from 'react';

type MapLayer = {
  id: string;
  name: string;
  selected: boolean;
  editMode: boolean;
};

export const useMapLayers = () => {
  const mockLayers: MapLayer[] = [
    {
      id: '1',
      name: 'Layer - 1',
      selected: true,
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

  return {
    layers,
    selectLayerHandler,
  };
};
