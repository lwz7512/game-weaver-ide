import clsx from 'clsx';

import { useCodeResultStage } from 'renderer/hooks/useCodeResultStage';

/**
 * Display Code running result with `canvas`
 * @2023/11/11
 *
 * TODO: listening event `TESTSTARTED` to stop demo mode of stage canvas!
 *
 */

type CanvasProps = {
  hideCursor?: boolean;
};

export const CodeResultStage = ({ hideCursor }: CanvasProps) => {
  useCodeResultStage();

  return (
    <div
      id="gameStage"
      className="coding-result-box "
      style={{ width: 440, height: 378 }}
    >
      <canvas
        id="codePresenter"
        width="440"
        height="378"
        className={clsx(
          'code-presenter bg-black block',
          hideCursor ? 'hide-cursor' : ''
        )}
      />
      <div className="coding-tips-panel slidein-from-bottom">
        {/* dynamic `p` list here, no more than 3 items - @2024/02/03 */}
      </div>
    </div>
  );
};
