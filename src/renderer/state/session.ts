/**
 * Cache some parameters in drawing period, untile app closed
 *
 * Created @2022/10/18
 */

import { DrawingSession, GeneralObject } from '../config';

const drawingTileSession: DrawingSession = {};

export const setDrawingSession = (session: GeneralObject) => {
  Object.keys(session).forEach((key) => {
    drawingTileSession[key] = session[key];
  });
};

export const getDrawingSession = () => drawingTileSession;