import clsx from 'clsx';

/**
 * Display Code running result with `canvas`
 * @2023/11/11
 */

type CanvasProps = {
  hideCursor?: boolean;
};

export const CodeResultStage = ({ hideCursor }: CanvasProps) => (
  <div className="coding-result-box ">
    <canvas
      id="codePresenter"
      width="440"
      height="378"
      className={clsx(
        'code-presenter bg-slate-50 block',
        hideCursor ? 'hide-cursor' : ''
      )}
    />
    <div className="coding-tips-panel slidein-from-bottom">
      {/* dynamic `p` list here, no more than 3 items - @2024/02/03 */}
    </div>
  </div>
);
