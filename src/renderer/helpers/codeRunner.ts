/**
 * Remote Code Running in client Logic
 * File Created at 2023/11/19
 */

const codeTipsSelector = '.coding-tips-panel';

/**
 * Custom Script Events
 */
export enum ChallengeEvents {
  /** test started */
  TESTSTARTED = 'testStarted',
  /** test function return `true` */
  TESTPASSED = 'testCasePassed',
  /** test function return `false` */
  TESTFAILED = 'testCaseFailed',
  /** user code running with error */
  EXCEPTION = 'ExceptionInCodeEvent',
  /** user code running on success */
  SUCCESS = 'SuccessCodeRunEvent',
  /** challenge completed */
  MISSION_COMPLETED = 'MissionCompleted',
}

export type TestCase = {
  /** case description */
  description: string;
  /** validator code logic */
  comment: string;
  /** validator function lines, defined remotely or implemented by user  */
  validator: string[];
  /** expected value from validator function */
  expectation: boolean | number;
  /** params from remote end, if validator functions are implemented by user, this is a must */
  params: (number | string)[];
  /** userCode to validate in validate function */
  userCode?: string;
};

export const stringLoader = async (
  url: string,
  fileType = 'txt',
  onSuccess: (result: any) => void,
  onError?: (error: any) => void
) => {
  try {
    console.log(`>>> loading start code: ${url}`);
    const resp4File = await fetch(url);
    const { status } = resp4File;
    if (status === 200) {
      if (fileType === 'txt') {
        const strContent = await resp4File.text();
        onSuccess(strContent);
      }
      if (fileType === 'json') {
        const jsonContent = await resp4File.json();
        onSuccess(jsonContent);
      }
    } else {
      throw new Error('Load Code Error!');
    }
  } catch (error) {
    onError && onError(error);
  }
};

export const clearCodeTips = () => {
  const codeTips = document.querySelector(codeTipsSelector);
  if (!codeTips) return;
  codeTips.innerHTML = '';
};

/**
 * Popup message panel, and close after 3 seconds
 *
 * @param message message item to show
 * @param isError if render in red
 * @param isSolo if the message is exclusive info, clear existing to show itself.
 * @returns
 */
export const toggleCodeTips = (
  message = 'Hooray!',
  isError = false,
  isSolo = false
) => {
  const codeTips = document.querySelector(codeTipsSelector);
  if (!codeTips) return;

  // open panel
  const style = codeTips.classList;
  const hasAnim = style.contains('animate');
  !hasAnim && style.add('animate');

  // clear existing content
  if (isSolo) codeTips.innerHTML = '';

  // add one message
  const info = document.createElement('p');
  info.innerHTML = message;
  const theme = isError ? 'failure' : 'success';
  info.classList.add(theme);
  // FIXME: make the single line bigger! - @2024/02/18
  isSolo && info.classList.add('solo');
  codeTips.appendChild(info);

  const hCodeTips = codeTips as HTMLElement;
  // check repeated call
  if (hCodeTips.dataset.scheduled) return;

  // auto close after 6 seconds
  const timeoutID = setTimeout(() => {
    style.remove('animate', 'red');
    codeTips.innerHTML = '';
    hCodeTips.dataset.scheduled = '';
  }, 6000);
  // mark scheduled close
  hCodeTips.dataset.scheduled = `${timeoutID}`;
};

// remove comment lines
// FIXME: replace single quote ' with double quote " as well!
// @2024/03/17
const sanitizedCode = (code: string | undefined) => {
  if (!code) return '';
  const lines = code.split('\n');
  const cleanLines = lines.map((l) =>
    l.trim().startsWith('//') ? '' : l.trim()
  );
  return cleanLines.join('').replaceAll("'", '"');
};

const paramFormat = (p: string | number | boolean) => {
  if (typeof p === 'string') return `'${p}'`;
  return p;
};

// code reducer from remote validator
const testCaseReducer = (prevLines: string[], ct: TestCase, index: number) => {
  const { validator, expectation, description, params } = ct;
  const testfunction = validator.join('\n');
  const cleanCode = sanitizedCode(ct.userCode);
  // console.log(cleanCode);
  // compose parameters used in validator
  const paramsFormated =
    params.length === 0
      ? paramFormat(cleanCode) // previously empty string: '""' , check user code instead with validator - 2023/12/03
      : params.reduce((prev: string | number | boolean, curr) => {
          if (prev === '') return paramFormat(curr);
          return `${prev}, ${paramFormat(curr)}`;
        }, ''); // start with empty params;
  // compose one test case code
  prevLines.push(
    `// === RUNNING TEST CASE - ${index} :`,
    `  try { `,
    `    const validator = ${testfunction};`,
    `    const testResult = validator(${paramsFormated});`,
    `    console.log(testResult)`,
    `    // validate with remote validator & assert function: `,
    `    assertEqual(testResult, ${expectation}, '${description}');`,
    `    // notify challeng playground: `,
    `    const payload = { detail: '${description}'};`,
    `    const event = new CustomEvent('${ChallengeEvents.TESTPASSED}', payload);`,
    `    document.dispatchEvent(event);`,
    `    // record one case success`,
    `    caseSuccess.push(1)`,
    `  } catch (error) {`,
    `    console.log('## Got error for test case:')`,
    `    const detail = { detail: error.message }`,
    `    const evt${index} = new CustomEvent('${ChallengeEvents.TESTFAILED}', detail)`,
    `    document.dispatchEvent(evt${index})`,
    `  }`
  );
  return prevLines;
};

/**
 * Exectue test function for local user code input in editor
 *
 * @log Revised on Feb 14 2024 for validator function params
 *
 * @param tests all the test cases for this challenge
 */
export const safeTestCode = (
  baseCode: string,
  userCode: string,
  tests: TestCase[]
) => {
  // FIXME: feed userCode to test cases to use in code reducer
  // @2024/02/29
  const testsWithUserCode = tests.map((t) => ({ ...t, userCode }));
  // assemble test code from validator
  const testLines: string[] = testsWithUserCode.reduce(testCaseReducer, []);

  // finaly code to be running in client
  const safeCompleteCode = [
    '',
    '(function(){',
    // STEP 1: initialize base code for user code & all the test cases
    `  ${baseCode}`,
    // STEP 2: run user code first
    '  try { ',
    `  ${userCode}`,
    // if base code incude debug function, use it after user code:
    `  // if(window.debug) window.debug();`,
    '  } catch (error) {',
    '    console.log(`## Caught error from code runner!`)',
    '    const detail = {detail: error.message}',
    `    const evt = new CustomEvent('${ChallengeEvents.EXCEPTION}', detail)`,
    `    document.dispatchEvent(evt)`,
    '  }',
    // success count used in `testLines`
    ` const caseSuccess = [];`,
    // STEP 3: run test cases
    // start code testing...
    ` const evt = new CustomEvent('${ChallengeEvents.TESTSTARTED}')`,
    ` document.dispatchEvent(evt)`,
    ...testLines,
    // STEP 4: check success of test cases
    `if(caseSuccess.length === ${tests.length}) {`,
    `   document.dispatchEvent(new Event('${ChallengeEvents.SUCCESS}'))`,
    `}`,
    // end of closure
    '})();', // semi colon is required here to end a closure call
    '', // end of one test case
  ];

  const executeScript = (code: string, id = 'dynaCode') => {
    const dynaCode = document.getElementById(id);
    if (dynaCode) dynaCode.remove(); // remove self

    // console.log(`>> to create script element ...`);
    const script = document.createElement('script');
    script.text = code;
    script.id = id;
    document.body.appendChild(script);
  };

  executeScript(safeCompleteCode.join('\n'), 'assertCode');
};
