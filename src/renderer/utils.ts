import { IFrameContext } from './config';

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

export const throttleURLHandler = (context: IFrameContext, delay: number) => {
  // If setTimeout is already scheduled, no need to do anything
  if (context.timerId) {
    return console.log('ignored!');
  }
  // Schedule a setTimeout after delay seconds
  context.timerId = setTimeout(() => {
    context.handler(context.url);
    // Once setTimeout function execution is finished, timerId = undefined so that in <br>
    // the next scroll event function execution can be scheduled by the setTimeout
    context.timerId = undefined;
  }, delay);
};
