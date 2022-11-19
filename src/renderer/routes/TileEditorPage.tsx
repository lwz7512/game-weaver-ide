import { Button, ButtonGroup } from '@blueprintjs/core';

import LeftSideBar from '../components/LeftSideBar';
import { InputField } from '../components/InputField';
import { MODULETYPES } from '../config';
import useLeftSideBar from '../hooks/useLeftSideBar';
import { TiledEditor } from '../tiled/Editor';
import { useSpriteSheetImage } from '../hooks/useSpriteSheetImage';
import { useSpritesPreview } from '../hooks/useSpritesPreview';
import { useMapDimension } from '../hooks/useMapSession';
import { MiniIconButton } from '../components/Buttons';

const TiledEditorPage = () => {
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

  return (
    <div className="tile-editor w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.TILED}
          onModuleChanged={onModuleChanged}
        />
      </div>
      <TiledEditor
        mapHeight={+mapHeight}
        mapWidth={+mapWidth}
        tileHeight={+tileHeight}
        tileWidth={+tileWidth}
      />
      <div className="object-explorer bg-gray-200 w-60">
        <h1 className="select-none text-base text-center p-2 bg-slate-600 text-white block mb-0 lg:mb-1">
          Spritesheet Explorer
        </h1>
        <div className="map-attributes-group px-0 lg:px-2 py-1 lg:py-2 ">
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
            onValueChange={(event) => mapWidthChangeHandler(event.target.value)}
          />
        </div>
        <div className="map-attributes-group px-0 lg:px-2 py-0 ">
          <InputField
            title="Tile Height"
            name="tileHeight"
            suffix="px"
            value={tileHeight}
            onValueChange={(event) =>
              tileHeightChangeHandler(event.target.value)
            }
          />
          <InputField
            title="Tile Width"
            name="tileWidth"
            suffix="px"
            value={tileWidth}
            onValueChange={(event) =>
              tileWidthChangeHandler(event.target.value)
            }
          />
        </div>
        {/* open file dialog */}
        <div className="p-2 my-1 flex ">
          <button
            type="button"
            className="blue-btn no-transform rounded-r-none"
            onClick={openFileDialog}
          >
            Open Local
          </button>
          <button
            type="button"
            className="orange-btn no-transform rounded-l-none"
            onClick={() => console.log('TODO: ...')}
          >
            Download Remote
          </button>
        </div>
        {/* sprites sheet preview, use width, height attributes only! */}
        {/* DO NOT USE CSS CLASS!!! */}
        <div className="flex items-center px-1 ">
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
        <ButtonGroup className="px-2 py-3" fill>
          <Button icon="new-layer" title="New Layer" intent="success" />
          <Button icon="arrow-up" title="Move Layer Up" intent="warning" />
          <Button icon="arrow-down" title="Move Layer Down" intent="warning" />
          <Button icon="trash" title="Delete Layer" intent="danger" />
          <Button icon="floppy-disk" title="Save Map" intent="primary" />
          <Button icon="export" title="Export To Json File" intent="success" />
        </ButtonGroup>
      </div>
    </div>
  );
};

export default TiledEditorPage;
