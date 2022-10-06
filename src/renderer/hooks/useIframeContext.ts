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
