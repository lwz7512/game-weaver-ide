/**
 * Cache some parameters in drawing period, untile app closed
 *
 * Created @2022/10/18
 */

import { GeneralObject } from '../config';

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
