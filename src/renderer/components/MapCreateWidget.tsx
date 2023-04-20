/**
 * create game map properties widget
 * @2023/02/04
 */

// import clsx from 'clsx';
import { Button, ButtonGroup, Intent } from '@blueprintjs/core';
import { InputField, SelectInput } from './InputField';
import { SaveGamePop } from './SaveGamePop';

type MapFieldProp = {
  name: string;
  value: string;
};

type MapExportProp = {
  name: string;
  games: string[];
  gameToExport: string;
  onExportPathChange: (game: string) => void;
};

type MapSizeProps = {
  mapWidth: string;
  mapHeight: string;
  tileWidth: string;
  tileHeight: string;
};

type MapSizeHandlersProps = {
  mapHeightChangeHandler: (v: string) => void;
  mapWidthChangeHandler: (v: string) => void;
  tileHeightChangeHandler: (v: string) => void;
  tileWidthChangeHandler: (v: string) => void;
};

type MapDimensionProps = MapSizeProps & {
  mapName: string;
  mapFilePath: string;
  games: string[];
  gameToExport: string;
  onExportPathChange: (game: string) => void;
};

type MapSizeComboProps = MapSizeProps & MapSizeHandlersProps;

type MapCreateWidgetProps = MapDimensionProps &
  MapSizeComboProps & {
    spacePath: string;
    newMapSaved: boolean;
    createNewMapHandler: () => void;
    mapSaveHandler: (name: string, path: string) => void;
    mapExportHandler: () => void;
    copyNamesHandler: () => void;
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

const MapFieldSelect = ({
  name,
  games,
  gameToExport,
  onExportPathChange,
}: MapExportProp) => (
  <li className="border-b border-gray-400 flex">
    <span className="p-1 w-20 bg-amber-100 inline-block border-r border-gray-400">
      {name}:
    </span>
    <select
      className="px-1 w-36 h-6 leading-6 inline-block overflow-hidden focus:outline-none"
      title="Export to game assets folder"
      value={gameToExport}
      onChange={(event) => onExportPathChange(event.target.value)}
    >
      <option value="default">Default</option>
      {games.map((game) => (
        <option key={game} value={game}>
          {game}
        </option>
      ))}
    </select>
  </li>
);

/**
 * Map info list display
 */
const MapDimensionGroup = ({
  mapName,
  mapFilePath,
  mapWidth,
  mapHeight,
  tileWidth,
  tileHeight,
  games,
  gameToExport,
  onExportPathChange,
}: MapDimensionProps) => (
  <ul className="bg-white h-44 mt-1 text-xs">
    <MapFieldRow name="Map Name" value={mapName} />
    <MapFieldRow name="Map Width" value={`${mapWidth}tiles`} />
    <MapFieldRow name="Map Height" value={`${mapHeight}tiles`} />
    <MapFieldRow name="Tile Width" value={`${tileWidth}px`} />
    <MapFieldRow name="Tile Hight" value={`${tileHeight}px`} />
    <MapFieldRow name="Save Path" value={mapFilePath} />
    <MapFieldSelect
      name="Export Path"
      games={games}
      gameToExport={gameToExport}
      onExportPathChange={onExportPathChange}
    />
  </ul>
);

/**
 * Map dimension settings
 */
const MapDimensionSetting = ({
  mapWidth,
  mapHeight,
  tileWidth,
  tileHeight,
  mapHeightChangeHandler,
  mapWidthChangeHandler,
  tileHeightChangeHandler,
  tileWidthChangeHandler,
}: MapSizeComboProps) => (
  <>
    <div className="map-attributes-group px-0 lg:px-2 py-1 ">
      <InputField
        title="Map Height"
        name="mapHeight"
        suffix="tiles"
        value={mapHeight}
        onValueChange={(event) => mapHeightChangeHandler(event.target.value)}
      />
      <InputField
        title="Map Width"
        name="mapWidth"
        suffix="tiles"
        value={mapWidth}
        onValueChange={(event) => mapWidthChangeHandler(event.target.value)}
      />
    </div>
    <div className="map-attributes-group px-0 lg:px-2 py-1 ">
      <SelectInput
        title="Tile Height"
        name="tileHeight"
        suffix="px"
        value={tileHeight}
        onValueChange={(event) => tileHeightChangeHandler(event.target.value)}
      />
      <SelectInput
        title="Tile Width"
        name="tileWidth"
        suffix="px"
        value={tileWidth}
        onValueChange={(event) => tileWidthChangeHandler(event.target.value)}
      />
    </div>
  </>
);

/**
 * Map creation & properties panel at top of tiled editor
 */
export const MapCreateWidget = ({
  newMapSaved,
  mapName,
  spacePath,
  mapFilePath,
  mapWidth,
  mapHeight,
  tileWidth,
  tileHeight,
  games,
  gameToExport,
  createNewMapHandler,
  mapSaveHandler,
  mapExportHandler,
  mapHeightChangeHandler,
  mapWidthChangeHandler,
  tileHeightChangeHandler,
  tileWidthChangeHandler,
  copyNamesHandler,
  onExportPathChange,
}: MapCreateWidgetProps) => {
  // basic dimension props
  const mapDimensionProps = {
    mapWidth,
    mapHeight,
    tileWidth,
    tileHeight,
  };

  const mapDimensionHandlers = {
    mapHeightChangeHandler,
    mapWidthChangeHandler,
    tileHeightChangeHandler,
    tileWidthChangeHandler,
  };

  const mapExportProps = {
    mapName,
    mapFilePath,
    games,
    gameToExport,
    onExportPathChange,
  };

  return (
    <>
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
          gameFileDirectory={spacePath}
          onMapNameConfirm={mapSaveHandler}
        />
        <Button
          icon="export"
          title="Export Map To Json File"
          intent="warning"
          className="focus:outline-0 no-transform rounded-r-none"
          onClick={mapExportHandler}
        />
        <Button
          icon="clipboard"
          title="Copy key names to clipboard"
          intent={Intent.DANGER}
          className="focus:outline-0 no-transform rounded-r-none"
          onClick={copyNamesHandler}
        />
      </ButtonGroup>
      {/* game properties grid */}
      {newMapSaved && (
        <MapDimensionGroup {...mapDimensionProps} {...mapExportProps} />
      )}
      {/* new map editing ... */}
      {!newMapSaved && (
        <MapDimensionSetting {...mapDimensionProps} {...mapDimensionHandlers} />
      )}
    </>
  );
};
