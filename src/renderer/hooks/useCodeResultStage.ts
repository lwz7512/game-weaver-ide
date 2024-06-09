/**
 * Listening Coding running events to:
 * - show mouse following torch effect before code running.
 * - stop mouse following effect after code start running.
 *
 * @date 2024/06/08
 */

import { useEffect } from 'react';
import { fairyDustCursor } from 'cursor-effects';

import { ChallengeEvents as EVT } from 'renderer/helpers/codeRunner';

/**
 * listening event `PREGAMERUNING` to show `fairyDustCursor` effect
 */
export const useCodeResultStage = () => {
  useEffect(() => {
    const targetElement = document.getElementById('gameStage');
    const dustCursor = fairyDustCursor({ element: targetElement || undefined });

    const onGameStartHandler = () => {
      dustCursor.destroy();
      // console.log(`## Dust Cursor Destroyed!`);
    };
    document.addEventListener(EVT.PREGAMERUNING, onGameStartHandler);

    return () => {
      dustCursor.destroy();
      document.removeEventListener(EVT.PREGAMERUNING, onGameStartHandler);
    };
  }, []);
};
