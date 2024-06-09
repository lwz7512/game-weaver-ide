import clsx from 'clsx';

import { useCodeResultStage } from 'renderer/hooks/useCodeResultStage';

type CanvasProps = {
  hideCursor?: boolean;
};

/**
 * Display Code running result with `canvas`
 *
 * @date 2023/11/11
 */
export const CodeResultStage = ({ hideCursor }: CanvasProps) => {
  // show `fairyDustCursor` on `#gameStage`
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
