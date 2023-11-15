// import { IFrameContext } from './config';

const executeScript = (code: string) => {
  const id = 'dynaCode';
  const dynaCode = document.getElementById(id);
  if (dynaCode) dynaCode.remove(); // remove self

  console.log(`>> to create script element ...`);
  const script = document.createElement('script');
  script.text = code;
  script.id = id;
  document.body.appendChild(script);
};

/**
 * add try...catch handling script execution
 *
 * @param baseCode
 * @param userCode
 */
export const safeRunCode = (baseCode: string, userCode: string) => {
  const codeLines = [
    baseCode,
    'try { ',
    userCode,
    '} catch (error) {',
    ' console.error(error);',
    '}',
  ];
  // const safeCompleteCode = `${baseCode} \n\n try { \n ${userCode} \n } catch (error) { \n console.error(error); \n }`;
  const safeCompleteCode = codeLines.join('\n');
  executeScript(safeCompleteCode);
};

export const checkMacPlatform = () => {
  const ua =
    typeof navigator !== 'undefined' &&
    typeof navigator.userAgent !== 'undefined'
      ? navigator.userAgent.toLowerCase()
      : '';
  return ua.indexOf('macintosh') !== -1;
};

export function debounce<A = unknown, R = void>(
  fn: (args: A) => R,
  ms: number
): [(args: A) => Promise<R>, () => void] {
  let timer: NodeJS.Timeout;

  const debouncedFunc = (args: A): Promise<R> =>
    new Promise((resolve) => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        resolve(fn(args));
      }, ms);
    });

  const teardown = () => clearTimeout(timer);

  return [debouncedFunc, teardown];
}

export const getThrottleFunction = (
  handler: (...args: unknown[]) => void,
  timeout = 300
) => {
  let timerId: NodeJS.Timeout | null;
  return (...args: unknown[]) => {
    if (timerId) return console.log('ignored!');

    timerId = setTimeout(() => {
      handler.apply(this, args);
      timerId = null; // clear this task
    }, timeout);
  };
};

export const getDebounceFunction = (
  handler: (...args: unknown[]) => void,
  timeout = 300
) => {
  let timerId: NodeJS.Timeout;
  return (...args: unknown[]) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      handler.apply(this, args);
    }, timeout);
  };
};

export const kebabCase = (str: string) =>
  str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
