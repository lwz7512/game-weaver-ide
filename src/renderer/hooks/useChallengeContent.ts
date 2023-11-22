/**
 * interactions of each challenge project
 *
 * @date 2023/11/11
 */

import JSConfetti from 'js-confetti';
import { useState, useEffect } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { sourceRepo, TSLIB } from '../config';
import {
  GWEvents,
  safeTestCode,
  TestCase,
  toggleCodeTips,
} from '../codeRunner';
import { Challenge } from './useChallenges';

export const useChallengeContent = (
  challenge: Challenge,
  editorLib: string
) => {
  // editor instance
  const monaco = useMonaco();

  const { id } = challenge;

  /**
   * user code in editor, start from remoted `startCode` in challenge definition
   */
  const [runningCode, setRunningCode] = useState('');

  /**
   * code running status, changed by button
   */
  const [startRunning, setRunningStart] = useState(false);

  /**
   * base code defined in challenge, that may include predefined functions to let user call,
   * but function implementation are hidden from user.
   */
  const [baseCode, setBaseCode] = useState('');

  /**
   * TODO: If `validator` function is empty and only 1 test case defined in challenge,
   * that means user need to implement a function, get user code as a validator!
   *
   * test cases defined in challenge, to check if user code
   * could meet the requirements of this challenge
   */
  const [testCases, setTestCases] = useState<TestCase[]>([]);

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

  /**
   * add external lib for editor to enable code completion(hint)
   */
  useEffect(() => {
    if (monaco) {
      // console.log('here is the monaco instance:', monaco);
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        editorLib,
        `ts:${TSLIB.GLOBAL}`
      );
    }
  }, [monaco, editorLib]);

  /**
   * Loading remote chalenge code including test code
   */
  useEffect(() => {
    const fetchChallengeCodes = async () => {
      const r = `?r=${Math.random()}`;
      const baseCodeURL = sourceRepo + challenge.baseCode + r;

      // STEP 1: base code loading
      console.log(`>>> loading base code: ${baseCodeURL}`);
      const resp4Base = await fetch(baseCodeURL);
      const code4Base = await resp4Base.text();
      console.log(code4Base);
      setBaseCode(code4Base);

      // STEP 2: start code loading
      const startCodeURL = sourceRepo + challenge.startCode;
      try {
        console.log(`>>> loading start code: ${startCodeURL}`);
        const resp4Start = await fetch(startCodeURL);
        const { status } = resp4Start;
        if (status === 200) {
          const code4Start = await resp4Start.text();
          console.log(code4Start);
          setRunningCode(code4Start);
        } else {
          throw new Error('Load Code Error!');
        }
      } catch (error) {
        setRunningCode('');
      }

      // STEP 3: test code loading
      const testCodeURL = sourceRepo + challenge.testCode;
      console.log(`>>> loading test code:`);
      const resp4Test = await fetch(testCodeURL);
      if (resp4Test.status === 200) {
        const tests: TestCase[] = await resp4Test.json();
        setTestCases(tests);
        console.log(tests);
      } else {
        console.warn('No test cases defined remotely on this challenge!');
      }
    };
    fetchChallengeCodes();
  }, [challenge]);

  /**
   * Waiting for running state change, then test/run code
   */
  useEffect(() => {
    if (!startRunning || !runningCode) return;

    // FIXME: to check empty validator in test case
    console.log(`>>> start code test:`);
    // First, execute all the test case defined in challenge
    setTimeout(() => safeTestCode(baseCode, runningCode, testCases), 200);

    // end of code execution
  }, [baseCode, runningCode, startRunning, testCases]);

  /**
   * Listening code testing and running sttus events
   */
  useEffect(() => {
    const jsConfetti = new JSConfetti();

    const { EXCEPTION, SUCCESS, TESTFAILED, TESTPASSED } = GWEvents;
    // error event handling
    const codeExecuteErrorHandler = (err: Event) => {
      const { detail } = err as CustomEvent;
      // console.log(` got error event info:`);
      // console.log(detail);
      toggleCodeTips(detail, true);
    };

    const codeExecuteSuccessHandler = () => {
      toggleCodeTips('Hooray! You completed this challenge! ', false, true);
      // fire confetti !
      jsConfetti.addConfetti();
    };

    // one test case FAILED
    const codeTestFailedHandler = (event: Event) => {
      const { detail } = event as CustomEvent;
      toggleCodeTips(detail, true);
    };

    // one test case SUCCESS
    const codeTestSPassedHandler = (event: Event) => {
      const { detail } = event as CustomEvent;
      toggleCodeTips(detail);
    };

    document.addEventListener(TESTFAILED, codeTestFailedHandler);
    document.addEventListener(TESTPASSED, codeTestSPassedHandler);
    document.addEventListener(EXCEPTION, codeExecuteErrorHandler);
    document.addEventListener(SUCCESS, codeExecuteSuccessHandler);

    return () => {
      document.removeEventListener(TESTFAILED, codeTestFailedHandler);
      document.removeEventListener(TESTPASSED, codeTestSPassedHandler);
      document.removeEventListener(EXCEPTION, codeExecuteErrorHandler);
      document.removeEventListener(SUCCESS, codeExecuteSuccessHandler);
      // recycle confetti canvas
      const rootCanvas = document.querySelector('body > canvas');
      rootCanvas && rootCanvas.remove();
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
