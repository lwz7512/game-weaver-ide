/**
 * Main logic for `TileEditorPage`
 * @2023/05/02
 */

import useLeftSideBar from '../hooks/useLeftSideBar';
import { useSpriteSheetImage } from '../hooks/useSpriteSheetImage';
import { useSpritesPreview } from '../hooks/useSpritesPreview';
import { useMapLayers } from '../hooks/useMapLayers';
import { useMapDimension } from '../hooks/useMapSession';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMapFile } from '../hooks/useMapFile';
import { useGMSpaceFolders } from '../hooks/useWorkspaceFile';
import { useBPToast } from '../hooks/useToast';

export const useTileEditorPage = () => {
  const { onModuleChanged } = useLeftSideBar();
  const { spacePath } = useLocalStorage();
  const { gameFolders: games } = useGMSpaceFolders();
  const {
    toastState,
    toasterCallback,
    addToast,
    addSuccessToast,
    addWarningToast,
  } = useBPToast();

  // define tilemap parameters
  const mapDimensions = useMapDimension();
  const { mapHeight, mapWidth, tileHeight, tileWidth, setAllDimension } =
    mapDimensions;
  const {
    dots,
    isLoadingTilesheet,
    selectedImage,
    loadPngFile,
    openFileDialog,
    navigateToNext,
    navigateToPrev,
    loadRemoteTilesheets,
  } = useSpriteSheetImage(
    +tileWidth || 0,
    +tileHeight || 0,
    spacePath,
    addSuccessToast,
    addWarningToast
  );

  // draw bird view of tilesheet
  useSpritesPreview(selectedImage, dots);

  const {
    gameToExport,
    mapName,
    mapFilePath,
    newMapSaved,
    mapSaveHistory,
    tabType,
    selectedMap,
    savedGWMap,
    loadMapBy,
    setTabType,
    createNewMapHandler,
    mapSaveHandler,
    mapExportHandler,
    copyNamesHandler,
    tileMapEditorSetter,
    onExportPathChange,
  } = useMapFile(
    spacePath,
    selectedImage,
    setAllDimension,
    loadPngFile,
    addToast
  );

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
    games,
    gameToExport,
    onExportPathChange,
    createNewMapHandler,
    mapSaveHandler,
    mapExportHandler,
    copyNamesHandler,
  };

  return {
    onModuleChanged,
    mapHeight,
    mapWidth,
    tileHeight,
    tileWidth,
    selectedImage,
    tileMapEditorSetter,
    mapWidgetProps,
    openFileDialog,
    loadRemoteTilesheets,
    isLoadingTilesheet,
    navigateToPrev,
    navigateToNext,
    layerCRUDProps,
    tabType,
    setTabType,
    layers,
    mapSaveHistory,
    selectedMap,
    loadMapBy,
    selectLayerHandler,
    layerNameChangeHandler,
    toggleAvailabilityHandler,
    toggleVisibilityHandler,
    toastState,
    toasterCallback,
  };
};
