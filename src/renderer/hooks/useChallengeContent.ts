/**
 * interactions of each challenge project
 *
 * @date 2023/11/11
 */

import JSConfetti from 'js-confetti';
import { useState, useEffect, useRef } from 'react';
import { Uri, editor } from 'monaco-editor';
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
  ChallengeEvents as CEVT,
  safeTestCode as runMyCode,
  TestCase,
  toggleCodeTips,
  clearCodeTips,
  stringLoader,
} from '../helpers/codeRunner';

export const useChallengePlayground = (
  challenge: Challenge,
  editorLib: string,
  warningHandler: (message: string) => void
) => {
  // monaco instance
  const monaco = useMonaco();

  const { id } = challenge;

  /**
   * remote code load flag for `startCode`
   */
  const [codeLoaded, setCodeLoaded] = useState(false);

  /**
   * == User Code in code editor ==
   * start from remoted `startCode` in challenge definition
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
   * Save the number of semicolon in the code
   *
   * FIXME: colon count need to be updated with starting code - @2024/02/03
   */
  const semiColonCountRef = useRef(0);

  /**
   * Colon counter
   */
  const colonCounter = (code: string) => {
    return (code.match(/;/g) || []).length;
  };

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

    // FIXME: to check empty validator in test case
    if (!testCases.length) {
      warningHandler(NO_TEST_CASES);
      return;
    }
    // First, execute all the test case defined in challenge
    setTimeout(() => runMyCode(baseCode, runningCode, testCases), 200);
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
    const countOfSemicolon = colonCounter(code);
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
    if (!monaco) return;

    const markerIterator = ([uri]: readonly Uri[]) => {
      const markers: editor.IMarker[] = monaco.editor.getModelMarkers({
        resource: uri,
      });
      // console.log(`>>> got errors in code editor!: ${markers.length}`);
      if (!markers.length) {
        // no error occured
        return setHasSyntaxError(false);
      }
      // two types of errors ignored for now
      // @2024/03/17
      const errors: { [code: string]: string } = {
        7027: 'Unreachable code detected.',
        6133: '? is declared but its value is never read.',
      };

      // FIXME: check two kinds of error to ignore
      // @2024/03/17
      const checkUnReachError = !!markers.find(
        (err) => !!errors[`${err.code}`]
      );
      if (checkUnReachError) {
        // console.log('## Ignore minor error 7027|6133 ...');
        return;
      }

      // disable the run button!
      setHasSyntaxError(true);

      // show tips in popup panel
      const iterator = (err: editor.IMarker) => {
        // console.log(`>>> editor error message:`);
        const { message, code } = err;
        // console.log(message);
        // console.log(code);
        // send message to playground ...
        toggleCodeTips(message, true, true);
      };
      markers.forEach(iterator);
    };
    // console.log('here is the monaco instance:', monaco);
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      editorLib,
      `ts:${TSLIB.GLOBAL}`
    );
    // check editor markers
    monaco.editor.onDidChangeMarkers(markerIterator);
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
        (code) => {
          setRunningCode(code);
          // FIXME: save the colon count at start - @2024/02/03
          semiColonCountRef.current = colonCounter(code);
          // FIXME: USE A FLAG to let editor know its time to decorate codes
          // @2024/04/19
          setCodeLoaded(true);
        },
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
   * Listening code testing and running sttus events
   */
  useEffect(() => {
    const jsConfetti = new JSConfetti();
    const hooraySound = new Audio(`${sourceRepo}assets/sound/hooray.mp3`);
    const warningSound = new Audio(`${sourceRepo}assets/sound/warning.mp3`);

    /**
     * Caught Exception in code execution!
     *
     * @param err
     */
    const codeExecuteErrorHandler = (err: Event) => {
      if (window.DEBUG) return;
      const { detail } = err as CustomEvent;
      toggleCodeTips(detail, true);
      warningSound.play();
    };

    // *** Mission Completed: ***
    // - fire confetti
    // - play sound
    // @2023/11/22
    const codeExecuteSuccessHandler = () => {
      if (window.DEBUG) return;
      toggleCodeTips(CHALLENGE_SUCCESS_MESSAGE, false, true);
      // fire confetti !
      jsConfetti.addConfetti();
      // make noise !
      hooraySound.play();
      // NOTIFY CHALLENGES HOOK SUCCES EVENT
      const completionEvt = new CustomEvent(CEVT.MISSION_COMPLETED, {
        detail: challenge.id,
      });
      document.dispatchEvent(completionEvt);
    };

    // one test case FAILED
    const codeTestFailedHandler = (event: Event) => {
      if (window.DEBUG) return;
      const { detail } = event as CustomEvent;
      toggleCodeTips(detail, true);
      warningSound.play();
    };

    // one test case SUCCESS
    const codeTestSPassedHandler = (event: Event) => {
      if (window.DEBUG) return;
      const { detail } = event as CustomEvent;
      toggleCodeTips(detail);
    };

    // code started handler
    const codeTestStartHandler = () => {
      if (window.DEBUG) return;
      clearCodeTips();
    };

    document.addEventListener(CEVT.TESTSTARTED, codeTestStartHandler);
    document.addEventListener(CEVT.TESTFAILED, codeTestFailedHandler);
    document.addEventListener(CEVT.TESTPASSED, codeTestSPassedHandler);
    document.addEventListener(CEVT.EXCEPTION, codeExecuteErrorHandler);
    document.addEventListener(CEVT.SUCCESS, codeExecuteSuccessHandler);

    return () => {
      document.removeEventListener(CEVT.TESTSTARTED, codeTestStartHandler);
      document.removeEventListener(CEVT.TESTFAILED, codeTestFailedHandler);
      document.removeEventListener(CEVT.TESTPASSED, codeTestSPassedHandler);
      document.removeEventListener(CEVT.EXCEPTION, codeExecuteErrorHandler);
      document.removeEventListener(CEVT.SUCCESS, codeExecuteSuccessHandler);
      // recycle confetti canvas
      const rootCanvas = document.querySelector('body > canvas');
      rootCanvas && rootCanvas.remove();
    };
  }, [challenge]);

  useEffect(() => {
    // FIXME: clean up game resources after playground closed!
    // @2024/03/01
    return () => {
      if (Object.hasOwn(window, 'stopGame')) {
        // stop game if its running!
        window.stopGame();
      }
    };
  }, []);

  return {
    id,
    baseCode,
    runningCode,
    startRunning,
    hasSyntaxError,
    codeLoaded,
    editChangeChandler,
    runCodeHandler,
  };
};
