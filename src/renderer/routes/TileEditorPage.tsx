import { useState } from 'react';
// import { TiledPanelResizeBar } from '../components/PreviewPanelHandleBar';
import LeftSideBar from '../components/LeftSideBar';
import { InputField } from '../components/InputField';
import { MODULETYPES } from '../config';
import useLeftSideBar from '../hooks/useLeftSideBar';
import { TiledEditor } from '../tiled/Editor';

const TiledEditorPage = () => {
  const { onModuleChanged } = useLeftSideBar();
  const [mapHeight, setMapHeight] = useState('20');
  const [mapWidth, setMapWidth] = useState('30');
  const [tileHeight, setTileHeight] = useState('32');
  const [tileWidth, setTileWidth] = useState('32');

  return (
    <div className="w-full h-screen flex">
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
      <div className="object-explorer bg-gray-200 w-60 ">
        {/* <TiledPanelResizeBar targeSelector=".object-explorer" /> */}
        <h1 className="select-none text-base text-center p-4 bg-slate-600 text-white block mb-2">
          Assets Explorer
        </h1>
        <div className="map-attributes-group px-2 py-2">
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
        <div className="map-attributes-group px-2 py-2">
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
      </div>
    </div>
  );
};

export default TiledEditorPage;
