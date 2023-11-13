/**
 * Display Code running result with `canvas`
 * @2023/11/11
 */

import { useEffect } from 'react';

export const CodeResultStage = ({
  code,
  startRun,
}: {
  code: string;
  startRun: boolean;
}) => {
  useEffect(() => {
    if (!startRun) return;

    console.log('### START TO EXECUTE CODE : ');
    console.log(code);
  }, [code, startRun]);

  return (
    <div className="coding-result-box border h-full border-gray-400 bg-slate-200 inline-block p-0.5">
      <canvas
        id="codePresenter"
        width="440"
        height="378"
        className="code-presenter bg-slate-50 block"
      />
    </div>
  );
};
