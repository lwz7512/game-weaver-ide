import { Icon } from '@blueprintjs/core';

export const WebDocViewer = () => {
  const closeChallengeLearningPage = () => {
    const pageCtnr = document.getElementById('full-screen-backdrop');
    pageCtnr && pageCtnr.classList.add('hidden');
    const wv = document.getElementById('doc-viewer');
    if (wv) {
      (wv as any).loadURL('about:blank');
    }
  };

  return (
    <div
      id="full-screen-backdrop"
      className="full-screen-webview hidden w-full h-full text-white absolute top-0 left-0 z-50 px-12"
    >
      <webview
        id="doc-viewer"
        src="about:blank"
        style={{
          display: 'inline-flex',
          width: '100%',
          height: '100%',
        }}
      />
      <button
        type="button"
        className="absolute top-3 right-3 text-green-500"
        onClick={() => closeChallengeLearningPage()}
      >
        <Icon icon="delete" size={24} color="currentColor" />
      </button>
    </div>
  );
};
