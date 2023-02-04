/**
 * Map resources management widget
 * @2023/02/04
 */

import { FC } from 'react';
import { Button, ButtonGroup } from '@blueprintjs/core';
import { LayerItem } from './LayerItem';
import { HistoryItem } from './HistoryItem';

import { SaveHistory, MapLayer } from '../config';

type LayerCRUDProps = {
  addNewLayer: () => void;
  moveLayerUp: () => void;
  moveLayerDown: () => void;
  deleteCurrentLayer: () => void;
};

export const LayersCRUD = ({
  addNewLayer,
  moveLayerDown,
  moveLayerUp,
  deleteCurrentLayer,
}: LayerCRUDProps) => (
  <ButtonGroup className="py-3" fill>
    <Button
      icon="new-layer"
      title="New Layer"
      intent="success"
      className="focus:outline-0 rounded-l-none"
      onClick={addNewLayer}
    />
    <Button
      icon="arrow-up"
      title="Move Layer Up"
      intent="warning"
      className="focus:outline-0"
      onClick={moveLayerUp}
    />
    <Button
      icon="arrow-down"
      title="Move Layer Down"
      intent="warning"
      className="focus:outline-0"
      onClick={moveLayerDown}
    />
    <Button
      icon="trash"
      title="Delete Layer"
      intent="danger"
      className="focus:outline-0 rounded-r-none"
      onClick={deleteCurrentLayer}
    />
  </ButtonGroup>
);

type MapLayersProps = {
  layers: MapLayer[];
  selectLayerHandler: (id: number) => void;
  layerNameChangeHandler: (id: number, name: string) => void;
  toggleAvailabilityHandler: (id: number, value: boolean) => void;
  toggleVisibilityHandler: (id: number, value: boolean) => void;
};

const MapLayerList = ({
  layers,
  selectLayerHandler,
  layerNameChangeHandler,
  toggleAvailabilityHandler,
  toggleVisibilityHandler,
}: MapLayersProps) => (
  <ul className="map-layers">
    {layers.map((l) => (
      <LayerItem
        key={l.id}
        layer={l}
        selectHandler={selectLayerHandler}
        inputChangeHandler={layerNameChangeHandler}
        availableToggleHandler={toggleAvailabilityHandler}
        visibleToggleHandler={toggleVisibilityHandler}
      />
    ))}
  </ul>
);

type MapHistoryProps = {
  mapSaveHistory: SaveHistory[];
  selectedMap: string | null;
  loadMapBy: (name: string, path: string) => void;
};

const MapHistoryList = ({
  mapSaveHistory,
  selectedMap,
  loadMapBy,
}: MapHistoryProps) => (
  <ul className="map-layers">
    {!!mapSaveHistory.length &&
      mapSaveHistory.map((m) => (
        <HistoryItem
          key={m.name}
          item={m}
          selectedMap={selectedMap}
          clickHandler={loadMapBy}
        />
      ))}
  </ul>
);

type MapListComboProps = MapLayersProps & MapHistoryProps;

const ListByType: { [key: string]: FC<any> } = {
  layers: (props) => <MapLayerList {...props} />,
  history: (props) => <MapHistoryList {...props} />,
};

export const MapListSwitch = ({
  type,
  props,
}: {
  type: string;
  props: MapListComboProps;
}) => {
  const TabContent = ListByType[type];
  return <TabContent {...props} />;
};
