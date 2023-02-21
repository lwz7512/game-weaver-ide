/**
 * Cache some parameters in drawing period, untile app closed
 *
 * Created @2022/10/18
 */

import { GWMap } from 'renderer/tiled';
import { GeneralObject } from '../config';

const drawingHistory: GWMap[] = [];

/**
 * Cache one map object for page switching restore
 * @param gm GWMap instance
 */
export const addGWMapRecord = (gm: GWMap) => {
  drawingHistory.push(gm);
};

export const getLastGWMap = (): GWMap | null => {
  if (drawingHistory.length) {
    return drawingHistory.slice(-1)[0];
  }
  return null;
};

const drawingTileSession: GeneralObject = {};

/**
 * save an object to session cache
 *
 * @param session ordinary obj
 */
export const setDrawingSession = (session: GeneralObject) => {
  Object.keys(session).forEach((key) => {
    drawingTileSession[key] = session[key];
  });
};

export const getDrawingSession = () => drawingTileSession;
export const getSessionBy = (key: string) => drawingTileSession[key];
export const getSessionToStr = (key: string) => {
  const value = drawingTileSession[key];
  return value ? value.toString() : '';
};
/**
 * clear layer info in session
 * @param layerId
 */
export const clearPaintedTiles = (layerId: number) => {
  delete drawingTileSession.layerPainted;
  delete drawingTileSession.rowSize;
  delete drawingTileSession.columnSize;
  delete drawingTileSession[`layer_${layerId}`];
};
