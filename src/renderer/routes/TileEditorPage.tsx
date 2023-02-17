import { Toaster } from '@blueprintjs/core';

import { MODULETYPES, GameMapXportParams } from '../config';
import { TiledEditor } from '../tiled/Editor';

import useLeftSideBar from '../hooks/useLeftSideBar';
import { useSpriteSheetImage } from '../hooks/useSpriteSheetImage';
import { useSpritesPreview } from '../hooks/useSpritesPreview';
import { useMapLayers } from '../hooks/useMapLayers';
import { useMapDimension } from '../hooks/useMapSession';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMapFile } from '../hooks/useMapFile';

import LeftSideBar from '../components/LeftSideBar';
import { MiniIconButton } from '../components/Buttons';
import { LayerHistoryTabs } from '../components/Tabs';
import { MapCreateWidget } from '../components/MapCreateWidget';
import { MapListSwitch, LayersCRUD } from '../components/MapLayerHistoryList';

const TiledEditorPage = () => {
  const { onModuleChanged } = useLeftSideBar();
  const { spacePath } = useLocalStorage();
  // define tilemap parameters
  const mapDimensions = useMapDimension();
  const { mapHeight, mapWidth, tileHeight, tileWidth } = mapDimensions;
  const {
    dots,
    selectedImage,
    loadPngFile,
    openFileDialog,
    navigateToNext,
    navigateToPrev,
  } = useSpriteSheetImage(+tileWidth || 0, +tileHeight || 0);

  // draw bird view of tilesheet
  useSpritesPreview(selectedImage, dots);

  // compose game parameters ....
  const mapParams: GameMapXportParams = {
    ...mapDimensions,
    sourceImage: selectedImage,
  };

  const {
    mapName,
    mapFilePath,
    newMapSaved,
    mapSaveHistory,
    toastState,
    tabType,
    selectedMap,
    savedGWMap,
    loadMapBy,
    setTabType,
    createNewMapHandler,
    mapSaveHandler,
    mapExportHandler,
    tileMapEditorSetter,
    toasterCallback,
  } = useMapFile(spacePath, mapParams, loadPngFile);

  const {
    layers,
    setLayers,
    selectLayerHandler,
    layerNameChangeHandler,
    toggleAvailabilityHandler,
    toggleVisibilityHandler,
    ...layerCRUDProps
  } = useMapLayers(savedGWMap, selectedImage);

  const mapWidgetProps = {
    ...mapDimensions,
    spacePath,
    newMapSaved,
    mapName,
    mapFilePath,
    createNewMapHandler,
    mapSaveHandler,
    mapExportHandler,
  };

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
        editorInstanceSaver={tileMapEditorSetter}
      />
      {/* === right side panel === */}
      <div className="object-explorer bg-gray-200 w-60 border-l-2 border-slate-500">
        <MapCreateWidget {...mapWidgetProps} />
        {/* open file dialog */}
        <div className="pb-2 my-1 flex ">
          <button
            type="button"
            className="blue-btn no-transform rounded-r-none rounded-none px-0 flex-1"
            onClick={openFileDialog}
          >
            Open Tilesheet
          </button>
          <button
            type="button"
            className="orange-btn no-transform rounded-l-none  rounded-none"
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
        {/* layer management buttons */}
        <LayersCRUD {...layerCRUDProps} />
        {/* layer | history switching */}
        <LayerHistoryTabs tabType={tabType} tabChangeHandler={setTabType} />
        <MapListSwitch
          type={tabType}
          props={{
            layers,
            mapSaveHistory,
            selectedMap,
            loadMapBy,
            selectLayerHandler,
            layerNameChangeHandler,
            toggleAvailabilityHandler,
            toggleVisibilityHandler,
          }}
        />
      </div>
      {/* toaster */}
      <Toaster {...toastState} ref={toasterCallback} />
    </div>
  );
};

export default TiledEditorPage;
