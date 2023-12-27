/**
 * interactions of each challenge project
 *
 * @date 2023/11/11
 */

import JSConfetti from 'js-confetti';
import { useState, useEffect, useRef } from 'react';
import { editor } from 'monaco-editor';
import { useMonaco } from '@monaco-editor/react';
import {
  sourceRepo,
  TSLIB,
  Challenge,
  CHALLENGE_SUCCESS_MESSAGE,
  NO_TEST_CASES,
} from '../config';
import { saveChallengeCompletion } from '../state/storage';
import {
  ChallengeEvents,
  safeTestCode,
  TestCase,
  toggleCodeTips,
  stringLoader,
} from '../helpers/codeRunner';

export const useChallengeContent = (
  challenge: Challenge,
  editorLib: string,
  warningHandler: (message: string) => void
) => {
  // monaco instance
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

  /**
   * Detected error in code content
   */
  const [hasSyntaxError, setHasSyntaxError] = useState(false);

  /**
   * save the number of semicolon in the code
   */
  const semiColonCountRef = useRef(0);

  /**
   * `Run` button press handler to open run flag
   *
   * @returns
   */
  const runCodeHandler = () => {
    if (!runningCode) {
      return toggleCodeTips('No Code to run!', true);
    }
    if (startRunning) return console.warn('[skip repeated running!]');
    setRunningStart(true);
    // reset to unstart after 400 ms, one round animation completed
    setTimeout(() => setRunningStart(false), 400);

    // add history cache
    saveChallengeCompletion(challenge.id, 'touched');
  };

  /**
   * Editor code content change handler to do:
   *
   * 1. save the latest code
   * 2. check `;` to invoke run button heatbeating
   *
   * @param code
   * @returns
   */
  const editChangeChandler = (code: string | undefined) => {
    if (!code) return console.warn('## got undefined code!');
    setRunningCode(code);

    // using `Regular Expression` to count the `;` then add animation to run button
    const countOfSemicolon = (code.match(/;/g) || []).length;
    // FIREST: check if `;` count is more
    if (countOfSemicolon > semiColonCountRef.current) {
      // add animation to button
      const runButton = document.querySelector('.center-run-button');
      runButton?.classList.add('heart');
      setTimeout(() => {
        runButton?.classList.remove('heart');
      }, 3000);
    }
    // THEN: save the count
    semiColonCountRef.current = countOfSemicolon;
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
      // check editor markers
      monaco.editor.onDidChangeMarkers(([uri]) => {
        const markers: editor.IMarker[] = monaco.editor.getModelMarkers({
          resource: uri,
        });
        if (!markers.length) {
          // no error occured
          return setHasSyntaxError(false);
        }
        const iterator = ({ message }: editor.IMarker) => {
          // send message to playground ...
          toggleCodeTips(message, true, true);
        };
        markers.forEach(iterator);
        setHasSyntaxError(true);
      });
    }
  }, [monaco, editorLib]);

  /**
   * Loading remote chalenge code including test code
   */
  useEffect(() => {
    const fetchChallengeCodes = async () => {
      // STEP 1: base code loading
      await stringLoader(
        sourceRepo + challenge.baseCode,
        'txt',
        (code) => setBaseCode(code),
        () => console.error('load error!')
      );

      // STEP 2: start code loading
      await stringLoader(
        sourceRepo + challenge.startCode,
        'txt',
        (code) => setRunningCode(code),
        () => setRunningCode('')
      );

      // STEP 3: test code loading
      await stringLoader(
        sourceRepo + challenge.testCode,
        'json',
        (tests) => setTestCases(tests),
        () => console.error('load error!')
      );
    };
    fetchChallengeCodes();
  }, [challenge]);

  /**
   * Waiting for running state change, then test/run code
   */
  useEffect(() => {
    if (!startRunning || !runningCode) return;

    // FIXME: to check empty validator in test case
    if (!testCases.length) {
      warningHandler(NO_TEST_CASES);
      return;
    }
    // First, execute all the test case defined in challenge
    setTimeout(() => safeTestCode(baseCode, runningCode, testCases), 200);

    // end of code execution
  }, [baseCode, runningCode, startRunning, testCases, warningHandler]);

  /**
   * Listening code testing and running sttus events
   */
  useEffect(() => {
    const jsConfetti = new JSConfetti();
    const hooraySound = new Audio(`${sourceRepo}assets/sound/hooray.mp3`);
    const warningSound = new Audio(`${sourceRepo}assets/sound/warning.mp3`);

    const { EXCEPTION, SUCCESS, TESTFAILED, TESTPASSED, MISSION_COMPLETED } =
      ChallengeEvents;

    /**
     * Caught Exception in code execution!
     *
     * @param err
     */
    const codeExecuteErrorHandler = (err: Event) => {
      const { detail } = err as CustomEvent;
      toggleCodeTips(detail, true);
      warningSound.play();
    };

    // *** Mission Completed: ***
    // - fire confetti
    // - play sound
    // @2023/11/22
    const codeExecuteSuccessHandler = () => {
      toggleCodeTips(CHALLENGE_SUCCESS_MESSAGE, false, true);
      // fire confetti !
      jsConfetti.addConfetti();
      // make noise !
      hooraySound.play();
      // NOTIFY CHALLENGES HOOK SUCCES EVENT
      const completionEvt = new CustomEvent(MISSION_COMPLETED, {
        detail: challenge.id,
      });
      document.dispatchEvent(completionEvt);
    };

    // one test case FAILED
    const codeTestFailedHandler = (event: Event) => {
      const { detail } = event as CustomEvent;
      toggleCodeTips(detail, true);
      warningSound.play();
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
  }, [challenge]);

  return {
    id,
    baseCode,
    runningCode,
    startRunning,
    hasSyntaxError,
    editChangeChandler,
    runCodeHandler,
  };
};
