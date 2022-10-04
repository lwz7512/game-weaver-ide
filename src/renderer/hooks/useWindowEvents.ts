import { useEffect } from 'react';

/**
 * handling iframe message!
 */
const useWindowEvents = () => {
  // waiting window object to handle events ...
  useEffect(() => {
    /**
     * handle message of game preview iframe.
     * @param event
     */
    const messageHanlder = (event: MessageEvent) => {
      console.log('>>> got message from iframe: ');
      console.log(event.data);
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
