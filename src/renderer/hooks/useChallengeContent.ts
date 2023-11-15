/**
 * interactions of each challenge project
 * @date 2023/11/11
 */

import { useState, useEffect } from 'react';

import { useMonaco } from '@monaco-editor/react';

import { Challenge } from './useChallenges';
import { sourceRepo, TSLIB } from '../config';

export const useChallengeContent = (
  challenge: Challenge,
  editorLib: string
) => {
  const { id } = challenge;
  const [runningCode, setRunningCode] = useState('');
  const [startRunning, setRunningStart] = useState(false);
  // base code
  const [baseCode, setBaseCode] = useState('');
  // editor instance
  const monaco = useMonaco();

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
    // fetching challenge code...
    const fetchChallengeCodes = async () => {
      const baseCodeURL = sourceRepo + challenge.baseCode;
      console.log(`>>> loading: ${baseCodeURL}`);
      const resp4Base = await fetch(baseCodeURL);
      const code4Base = await resp4Base.text();
      // console.log(code4Base);
      setBaseCode(code4Base);

      const startCodeURL = sourceRepo + challenge.startCode;
      console.log(`>>> loading: ${startCodeURL}`);
      const resp4Start = await fetch(startCodeURL);
      const code4Start = await resp4Start.text();
      setRunningCode(code4Start);
    };
    fetchChallengeCodes();
  }, [challenge]);

  useEffect(() => {
    if (monaco) {
      console.log('here is the monaco instance:', monaco);
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        editorLib,
        `ts:${TSLIB.GLOBAL}`
      );
    }
  }, [monaco, editorLib]);

  return {
    id,
    baseCode,
    runningCode,
    startRunning,
    editChangeChandler,
    runCodeHandler,
  };
};
