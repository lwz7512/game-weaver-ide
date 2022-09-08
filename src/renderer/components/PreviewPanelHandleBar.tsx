import useResizeHandleBar from '../hooks/useResizeHandleBar';

type HandleBarProps = {
  targeSelector: string;
  onVerticalMove?: (deltaH: number) => void;
};

/**
 * under CodeEditorPage:
 */
export const PreviewPanelHandleBar = ({
  targeSelector,
  onVerticalMove,
}: HandleBarProps) => {
  useResizeHandleBar(targeSelector, 'v', onVerticalMove);

  return (
    <div className="handle-bar-section flex justify-center bg-gray-100">
      <div className="handle-bar bg-gray-400 w-16 h-1 rounded cursor-row-resize " />
    </div>
  );
};

export const TiledPanelResizeBar = ({
  targeSelector,
  onVerticalMove,
}: HandleBarProps) => {
  useResizeHandleBar(targeSelector, 'h', onVerticalMove);
  return (
    <div className="handler-bar-box w-1 bg-gray-100 flex flex-col justify-center">
      <div className="handle-bar bg-gray-400 w-1 h-16 rounded cursor-col-resize " />
    </div>
  );
};
