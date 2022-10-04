import { useEffect } from 'react';
import { port } from '../config';

type ConsoleType = { [type: string]: (...data: unknown[]) => void };

/**
 * handling iframe message!
 */
const useWindowEvents = () => {
  // waiting window object to handle events ...
  useEffect(() => {
    const consoleOverrides: ConsoleType = {
      ERROR: console.error,
      LOG: console.log,
      WARN: console.warn,
      INFO: console.info,
      CLEAR: console.clear,
    };

    /**
     * handle message of game preview iframe.
     * @param event
     */
    const messageHanlder = (event: MessageEvent) => {
      if (event.origin !== `http://localhost:${port}`) {
        return; // only care about messge from game bridge!
      }
      // console.log({ origin: event.origin });
      const isConsole = event.data.command === 'console';

      if (isConsole) {
        const { type, data } = JSON.parse(event.data.text);
        consoleOverrides[type].apply(null, [data]);
      }
    };

    const errorHandler = (event: ErrorEvent) => {
      // TODO: handle error of this app ...
    };

    window.addEventListener('message', messageHanlder, false);
    window.addEventListener('error', errorHandler, false);

    return () => {
      window.removeEventListener('message', messageHanlder);
      window.removeEventListener('error', errorHandler);
    };
  }, []);
};

export default useWindowEvents;
