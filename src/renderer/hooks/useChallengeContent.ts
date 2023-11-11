/**
 * interactions of each challenge project
 * @date 2023/11/11
 */

import { useState, useEffect } from 'react';

import { Challenge } from './useChallenges';

export const useChallengeContent = (clg: Challenge) => {
  const { id } = clg;
  const [runningCode, setRunningCode] = useState(
    '// Welcome to challenge project ONE!'
  );
  const [startRunning, setRunningStart] = useState(false);

  const runCodeHandler = () => {
    if (startRunning) return console.warn('[skip repeated running!]');
    setRunningStart(true);
    // reset to unstart after 400 ms, one round animation completed
    setTimeout(() => setRunningStart(false), 400);
  };

  const editChangeChandler = (code: string | undefined) => {
    if (!code) return console.warn('## got undefined code!');
    setRunningCode(code);
  };

  useEffect(() => {
    // TODO: fetching challenge code...
  }, []);

  return {
    id,
    runningCode,
    startRunning,
    editChangeChandler,
    runCodeHandler,
  };
};
