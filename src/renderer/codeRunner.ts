/**
 * Custom Script Events
 */
export enum GWEvents {
  /** test function return `true` */
  TESTPASSED = 'testCasePassed',
  /** test function return `false` */
  TESTFAILED = 'testCaseFailed',
  /** user code running with error */
  EXCEPTION = 'ExceptionInCodeEvent',
  /** user code running on success */
  SUCCESS = 'SuccessCodeRunEvent',
}

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
  const codeTips = document.querySelector('.coding-tips-panel');
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
  codeTips.appendChild(info);

  const hCodeTips = codeTips as HTMLElement;
  // check repeated call
  if (hCodeTips.dataset.scheduled) return;

  // auto close
  const timeoutID = setTimeout(() => {
    style.remove('animate', 'red');
    codeTips.innerHTML = '';
    hCodeTips.dataset.scheduled = '';
  }, 10000);
  // mark scheduled close
  hCodeTips.dataset.scheduled = `${timeoutID}`;
};

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
};

const executeScript = (code: string, id = 'dynaCode') => {
  const dynaCode = document.getElementById(id);
  if (dynaCode) dynaCode.remove(); // remove self

  // console.log(`>> to create script element ...`);
  const script = document.createElement('script');
  script.text = code;
  script.id = id;
  document.body.appendChild(script);
};

/**
 * Exectue test function for local user code input in editor
 *
 * @param tests all the test cases for this challenge
 */
export const safeTestCode = (
  baseCode: string,
  userCode: string,
  tests: TestCase[]
) => {
  const pf = (p: string | number | boolean) => {
    if (typeof p === 'string') return `'${p}'`;
    return p;
  };
  // total code lines for all the test cases
  const testLines: string[] = [];

  // assemble test code
  tests.forEach((t) => {
    const params = ['red', 1, true];
    const { validator, expectation, description } = t;
    const testfunction = validator.join('\n');
    const paramsFormated =
      params.length === 0
        ? '""'
        : params.reduce((prev, curr) => {
            if (prev === '') return pf(curr);
            return `${prev}, ${pf(curr)}`;
          }, ''); // empty params;
    testLines.push(
      '  try { ',
      `    const validator = ${testfunction};`,
      `    const testResult = validator(${paramsFormated});`,
      `    // validate with remote validator & assert function: `,
      `    assertEqual(testResult, ${expectation}, '${description}');`,
      `    // notify challeng playground: `,
      `    const payload = { detail: '${description}'};`,
      `    const event = new CustomEvent('${GWEvents.TESTPASSED}', payload);`,
      `    document.dispatchEvent(event);`,
      `    // record one case success`,
      `    caseSuccess.push(1)`,
      '  } catch (error) {',
      '    console.log(`## Got error:`)',
      '    const detail = { detail: error.message }',
      `    const evt = new CustomEvent('${GWEvents.TESTFAILED}', detail)`,
      `    document.dispatchEvent(evt)`,
      '  }'
    );
  }); // end of test case loop

  const safeCompleteCode = [
    '(function(){',
    // step 1: initialize base code for user code & all the test cases
    `  ${baseCode}`,
    // step 2: run user code first
    '  try { ',
    `  ${userCode}`,
    '  } catch (error) {',
    '    console.log(`## Got error:`)',
    '    const detail = {detail: error.message}',
    `    const evt = new CustomEvent('${GWEvents.EXCEPTION}', detail)`,
    `    document.dispatchEvent(evt)`,
    '  }',
    // success count
    ` const caseSuccess = [];`,
    // step 3: run test cases
    ...testLines,
    `if(caseSuccess.length === ${tests.length}) {`,
    `   document.dispatchEvent(new Event('${GWEvents.SUCCESS}'))`,
    `}`,
    // end of closure
    '})();', // semi colon is required here to end a closure call
    '', // end of one test case
  ];

  executeScript(safeCompleteCode.join('\n'), 'assertCode');
};

/**
 * @deprecated
 * Wrap base code and user code into a javascript closure, and handle exception
 * FIXME: run testfunction after user code is a good idea ?
 *
 * @date 2023/11/15
 * @param baseCode
 * @param userCode
 */
// export const safeRunCode = (baseCode: string, userCode: string) => {
//   const codeLines = [
//     '(function(){',
//     baseCode,
//     '  try { ',
//     userCode,
//     `    document.dispatchEvent(new Event('${GWEvents.SUCCESS}'))`,
//     '  } catch (error) {',
//     '    console.log(`## Got error:`)',
//     '    const detail = {detail: error.message}',
//     `    const evt = new CustomEvent('${GWEvents.EXCEPTION}', detail)`,
//     `    document.dispatchEvent(evt)`,
//     '  }',
//     '})()',
//   ];
//   const safeCompleteCode = codeLines.join('\n');
//   executeScript(safeCompleteCode);
// };
