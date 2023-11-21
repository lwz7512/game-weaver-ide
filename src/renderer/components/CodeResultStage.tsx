/**
 * Display Code running result with `canvas`
 * @2023/11/11
 */

export const CodeResultStage = () => (
  <div className="coding-result-box border h-full border-gray-400 bg-slate-200 inline-block p-0.5 relative overflow-hidden">
    <canvas
      id="codePresenter"
      width="440"
      height="378"
      className="code-presenter bg-slate-50 block"
    />
    <div className="coding-tips-panel slidein-from-bottom ">
      {/* dynamic `p` list */}
    </div>
  </div>
);
