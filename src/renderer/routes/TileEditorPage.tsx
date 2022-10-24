import { useState } from 'react';
// import { TiledPanelResizeBar } from '../components/PreviewPanelHandleBar';
import LeftSideBar from '../components/LeftSideBar';
import { InputField } from '../components/InputField';
import { MODULETYPES } from '../config';
import useLeftSideBar from '../hooks/useLeftSideBar';
import { TiledEditor } from '../tiled/Editor';
import { useSpriteSheetImage } from '../hooks/useSpriteSheetImage';
import { useSpritesPreview } from '../hooks/useSpritesPreview';

const TiledEditorPage = () => {
  const { onModuleChanged } = useLeftSideBar();
  // define tilemap parameters
  const [mapHeight, setMapHeight] = useState('20');
  const [mapWidth, setMapWidth] = useState('30');
  const [tileHeight, setTileHeight] = useState('32');
  const [tileWidth, setTileWidth] = useState('32');

  const { selectedImage, openFileDialog } = useSpriteSheetImage(
    +tileWidth,
    +tileHeight
  );
  useSpritesPreview(selectedImage);

  return (
    <div className="tile-editor w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.TILED}
          onModuleChanged={onModuleChanged}
        />
      </div>
      <div className="flex-1 bg-white">
        <TiledEditor
          mapHeight={+mapHeight}
          mapWidth={+mapWidth}
          tileHeight={+tileHeight}
          tileWidth={+tileWidth}
        />
      </div>
      <div className="object-explorer bg-gray-200 w-60">
        {/* <TiledPanelResizeBar targeSelector=".object-explorer" /> */}
        <h1 className="select-none text-base text-center p-2 bg-slate-600 text-white block mb-0 lg:mb-1">
          Spritesheet Explorer
        </h1>
        <div className="map-attributes-group px-0 lg:px-2 py-1 lg:py-2 ">
          <InputField
            title="Map Height"
            name="mapHeight"
            suffix="tiles"
            value={mapHeight}
            onValueChange={(event) => setMapHeight(event.target.value)}
          />
          <InputField
            title="Map Width"
            name="mapWidth"
            suffix="tiles"
            value={mapWidth}
            onValueChange={(event) => setMapWidth(event.target.value)}
          />
        </div>
        <div className="map-attributes-group px-0 lg:px-2 py-0 ">
          <InputField
            title="Tile Height"
            name="tileHeight"
            suffix="px"
            value={tileHeight}
            onValueChange={(event) => setTileHeight(event.target.value)}
          />
          <InputField
            title="Tile Width"
            name="tileWidth"
            suffix="px"
            value={tileWidth}
            onValueChange={(event) => setTileWidth(event.target.value)}
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
        {/* FIXME: sprites sheet preview, use width, height attributes only! */}
        {/* DO NOT USE CSS CLASS!!! */}
        <div className="p-1 flex justify-center">
          <canvas
            id="spritesPreview"
            width="192"
            height="128"
            className="bg-white border border-gray-500"
          />
        </div>
        {/* spritesheet image slider button */}
      </div>
    </div>
  );
};

export default TiledEditorPage;
