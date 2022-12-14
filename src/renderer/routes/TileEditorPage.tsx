import { useState } from 'react';
import { Button, ButtonGroup } from '@blueprintjs/core';

import LeftSideBar from '../components/LeftSideBar';
import { InputField, SelectInput } from '../components/InputField';
import { MODULETYPES } from '../config';
import useLeftSideBar from '../hooks/useLeftSideBar';
import { TiledEditor } from '../tiled/Editor';
import { useSpriteSheetImage } from '../hooks/useSpriteSheetImage';
import { useSpritesPreview } from '../hooks/useSpritesPreview';
import { useMapLayers } from '../hooks/useMapLayers';
import { useMapDimension } from '../hooks/useMapSession';
import { MiniIconButton } from '../components/Buttons';
import { LayerHistoryTabs } from '../components/Tabs';
import { LayerItem } from '../components/LayerItem';
import { SaveGamePop } from '../components/SaveGamePop';
import { useMapFile } from '../hooks/useMapFile';

type MapFieldProp = {
  name: string;
  value: string;
};

const MapFieldRow = ({ name, value }: MapFieldProp) => (
  <li className="border-b border-gray-400 flex">
    <span className="p-1 w-20 bg-amber-100 inline-block border-r border-gray-400">
      {name}:
    </span>
    <span
      className="px-1 w-36 h-6 leading-6 inline-block overflow-hidden"
      title={value}
    >
      {value}
    </span>
  </li>
);

const TiledEditorPage = () => {
  // tab switch
  const [tabType, setTabType] = useState('layers');
  const { onModuleChanged } = useLeftSideBar();
  // define tilemap parameters
  const {
    mapHeight,
    mapWidth,
    tileHeight,
    tileWidth,
    mapHeightChangeHandler,
    mapWidthChangeHandler,
    tileHeightChangeHandler,
    tileWidthChangeHandler,
  } = useMapDimension();
  const {
    dots,
    selectedImage,
    openFileDialog,
    navigateToNext,
    navigateToPrev,
  } = useSpriteSheetImage(+tileWidth || 0, +tileHeight || 0);
  useSpritesPreview(selectedImage, dots);

  const {
    layers,
    selectLayerHandler,
    layerNameChangeHandler,
    addNewLayer,
    deleteCurrentLayer,
    moveLayerDown,
    moveLayerUp,
    toggleAvailabilityHandler,
    toggleVisibilityHandler,
  } = useMapLayers();

  const {
    mapName,
    mapFilePath,
    createNewMapHandler,
    mapSaveHandler,
    newMapSaved,
  } = useMapFile('/user/lwz/gamespace');

  return (
    <div className="tile-editor w-full h-screen flex">
      {/* === left side bar === */}
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.TILED}
          onModuleChanged={onModuleChanged}
        />
      </div>
      {/* === center map editor === */}
      <TiledEditor
        mapHeight={+mapHeight}
        mapWidth={+mapWidth}
        tileHeight={+tileHeight}
        tileWidth={+tileWidth}
        selectedImage={selectedImage}
      />
      {/* === right side panel === */}
      <div className="object-explorer bg-gray-200 w-60 border-l-2 border-slate-500">
        <h1 className="select-none text-base text-center p-2 bg-slate-600 text-white block mb-0">
          {newMapSaved ? mapName : 'New Game Map'}
        </h1>
        <ButtonGroup className="" fill>
          <Button
            icon="map-create"
            title="New Map"
            intent="success"
            className="focus:outline-0 no-transform rounded-l-none"
            onClick={createNewMapHandler}
          />
          <SaveGamePop
            savedMapName={mapName}
            gameFileDirectory="/user/lwz/gamespace"
            onMapNameConfirm={mapSaveHandler}
          />
          <Button
            icon="export"
            title="Export Map To Json File"
            intent="warning"
            className="focus:outline-0 no-transform rounded-r-none"
          />
        </ButtonGroup>
        {/* game properties grid */}
        {newMapSaved && (
          <ul className="bg-white h-40 mt-1 text-xs">
            <MapFieldRow name="Map Name" value={mapName} />
            <MapFieldRow name="Map Width" value={`${mapWidth}tiles`} />
            <MapFieldRow name="Map Height" value={`${mapHeight}tiles`} />
            <MapFieldRow name="Tile Width" value={`${tileWidth}px`} />
            <MapFieldRow name="Tile Hight" value={`${tileHeight}px`} />
            <MapFieldRow name="Save Path" value={mapFilePath} />
          </ul>
        )}
        {!newMapSaved && (
          <>
            <div className="map-attributes-group px-0 lg:px-2 py-1 ">
              <InputField
                title="Map Height"
                name="mapHeight"
                suffix="tiles"
                value={mapHeight}
                onValueChange={(event) =>
                  mapHeightChangeHandler(event.target.value)
                }
              />
              <InputField
                title="Map Width"
                name="mapWidth"
                suffix="tiles"
                value={mapWidth}
                onValueChange={(event) =>
                  mapWidthChangeHandler(event.target.value)
                }
              />
            </div>
            <div className="map-attributes-group px-0 lg:px-2 py-1 ">
              <SelectInput
                title="Tile Height"
                name="tileHeight"
                suffix="px"
                value={tileHeight}
                onValueChange={(event) =>
                  tileHeightChangeHandler(event.target.value)
                }
              />
              <SelectInput
                title="Tile Width"
                name="tileWidth"
                suffix="px"
                value={tileWidth}
                onValueChange={(event) =>
                  tileWidthChangeHandler(event.target.value)
                }
              />
            </div>
          </>
        )}
        {/* open file dialog */}
        <div className="pb-2 my-1 flex ">
          <button
            type="button"
            className="blue-btn no-transform rounded-r-none px-4 rounded-none"
            onClick={openFileDialog}
          >
            Open Local
          </button>
          <button
            type="button"
            className="orange-btn no-transform rounded-l-none flex-1 rounded-none"
            onClick={() => console.log('TODO: ...')}
          >
            Download Remote
          </button>
        </div>
        {/* sprites sheet preview, use width, height attributes only! */}
        {/* DO NOT USE CSS CLASS!!! */}
        <div className="flex items-center">
          <MiniIconButton icon="caret-left" onClick={navigateToPrev} />
          <canvas
            id="spritesPreview"
            width="192"
            height="128"
            className="bg-white border border-gray-500 block w-48 h-32 ml-1"
          />
          <MiniIconButton icon="caret-right" onClick={navigateToNext} />
        </div>
        {/* TODO: layer management buttons */}
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
        {/* layer | history switching */}
        <LayerHistoryTabs tabType={tabType} tabChangeHandler={setTabType} />
        {/* layers management */}
        {tabType === 'layers' && (
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
        )}
        {/* history files */}
        {tabType === 'history' && (
          <ul className="map-layers">
            <li className="layer-item bg-blue-600 text-white py-1 px-2">
              Map 1
            </li>
            <li className="layer-item py-1 px-2">Map 2</li>
            <li className="layer-item py-1 px-2">Map 3</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default TiledEditorPage;
