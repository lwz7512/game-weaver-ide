/**
 * Cache some parameters in drawing period, untile app closed
 *
 * Created @2022/10/18
 */

import { GWMap } from 'renderer/tiled';
import { GeneralObject } from '../config';

// ============== Game editing session management ==================

const gameEditSession: GeneralObject = {};

export const saveLastOpenGame = (game: string) => {
  gameEditSession.game = game;
};

export const getLastOpenGame = () => {
  return (gameEditSession.game as string) || '';
};

export const cacheLastGameCode = (game: string, code: string) => {
  gameEditSession[game] = code;
};

export const getLastGameCode = (game: string) => {
  return (gameEditSession[game] as string) || '';
};

// ============== Drawing session management ==================

const drawingHistory: GWMap[] = [];

/**
 * Cache one map object for page switching restore
 * @param gm GWMap instance
 */
export const addGWMapRecord = (gm: GWMap) => {
  drawingHistory.push(gm);
};

/**
 * Get the last saved map object
 * @returns gm instance
 */
export const getLastGWMap = (): GWMap | null => {
  if (drawingHistory.length) {
    return drawingHistory.slice(-1)[0];
  }
  return null;
};

export const clearLastMap = () => {
  drawingHistory.length = 0;
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
