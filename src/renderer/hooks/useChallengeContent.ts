/**
 * interactions of each challenge project
 * @date 2023/11/11
 */

import { useState, useEffect } from 'react';

import { useMonaco } from '@monaco-editor/react';
import { sourceRepo, TSLIB } from '../config';
import { safeRunCode, GWEvents } from '../utils';
import { Challenge } from './useChallenges';

/**
 * Popup message panel, and close after 3 seconds
 *
 * @param message
 * @param isError
 * @returns
 */
const toggleCodeTips = (message = 'Hooray!', isError = false) => {
  const codeTips = document.querySelector('.coding-tips-panel');
  if (!codeTips) return;

  const style = codeTips.classList;
  style.add('animate');
  isError && style.add('red');
  codeTips.innerHTML = message;

  setTimeout(() => {
    style.remove('animate', 'red');
  }, 3000);
};

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
    if (!runningCode) {
      return toggleCodeTips('No Code to run!', true);
    }
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
      const r = `?r=${Math.random()}`;
      const baseCodeURL = sourceRepo + challenge.baseCode + r;
      // console.log(`>>> loading: ${baseCodeURL}`);
      const resp4Base = await fetch(baseCodeURL);
      const code4Base = await resp4Base.text();
      // console.log(code4Base);
      setBaseCode(code4Base);

      const startCodeURL = sourceRepo + challenge.startCode;
      try {
        // console.log(`>>> loading: ${startCodeURL}`);
        const resp4Start = await fetch(startCodeURL);
        const { status } = resp4Start;
        // console.log({ status });
        if (status === 200) {
          const code4Start = await resp4Start.text();
          setRunningCode(code4Start);
        } else {
          throw new Error('Load Code Error!');
        }
      } catch (error) {
        setRunningCode('');
      }
    };
    fetchChallengeCodes();
  }, [challenge]);

  useEffect(() => {
    if (monaco) {
      // console.log('here is the monaco instance:', monaco);
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        editorLib,
        `ts:${TSLIB.GLOBAL}`
      );
    }
  }, [monaco, editorLib]);

  useEffect(() => {
    if (!startRunning || !runningCode) return;

    // FIXME: test `runningCode` before running ...

    // wait after `run` button complete
    setTimeout(() => safeRunCode(baseCode, runningCode), 400);
  }, [baseCode, runningCode, startRunning]);

  useEffect(() => {
    const { EXCEPTION, SUCCESS } = GWEvents;
    // error event handling
    const codeExecuteErrorHandler = (err: Event) => {
      const { detail } = err as CustomEvent;
      // console.log(` got error event info:`);
      // console.log(detail);
      toggleCodeTips(detail, true);
    };

    const codeExecuteSuccessHandler = () => {
      toggleCodeTips('## Hooray! ##');
    };

    document.addEventListener(EXCEPTION, codeExecuteErrorHandler);
    document.addEventListener(SUCCESS, codeExecuteSuccessHandler);

    return () => {
      document.removeEventListener(EXCEPTION, codeExecuteErrorHandler);
      document.removeEventListener(SUCCESS, codeExecuteSuccessHandler);
    };
  }, []);

  return {
    id,
    baseCode,
    runningCode,
    startRunning,
    editChangeChandler,
    runCodeHandler,
  };
};
