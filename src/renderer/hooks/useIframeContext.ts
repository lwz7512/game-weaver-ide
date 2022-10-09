import { useEffect } from 'react';
import { IFrameContext } from '../config';

/**
 * iframe refresh context
 */
const webviewContext: IFrameContext = {
  url: '', // not in use
  timerId: undefined, // not in use
  handler: (...args: unknown[]) => {
    const iframe = document.getElementById('gwpreview');
    if (!iframe || args.length === 0) return;

    const gwPreview = iframe as HTMLIFrameElement;
    gwPreview.src = args.shift() as string;
  },
};

export const useIframeContext = (
  url: string,
  saveFirst: () => Promise<void>
) => {
  // keep it for later refresh
  webviewContext.url = url;

  return async () => {
    await saveFirst();
    webviewContext.handler(webviewContext.url);
  };
};

export const useIframeFocus = () => {
  useEffect(() => {
    const options = {
      root: document.querySelector('.examples-container'),
      rootMargin: '0px',
      threshold: 0.01,
    };
    const callback: IntersectionObserverCallback = (entries, observer) => {
      setTimeout(() => {
        const lastEntry = entries[0];
        const iframe = lastEntry.target as HTMLElement;
        iframe.focus();
      }, 2000); // lazy focus is needed for assest download...
    };
    const observer = new IntersectionObserver(callback, options);
    const targets = document.querySelectorAll('iframe');
    targets.forEach((iframe) => observer.observe(iframe));

    return () => {
      targets.forEach((iframe) => observer.unobserve(iframe));
    };
  }, []);
};
