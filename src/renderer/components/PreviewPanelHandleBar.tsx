import useResizeHandleBar from '../hooks/useResizeHandleBar';

type HandleBarProps = {
  targeSelector: string;
};

export const TiledPanelResizeBar = ({ targeSelector }: HandleBarProps) => {
  useResizeHandleBar(targeSelector, 'h');
  return (
    <div className="handler-bar-box w-1 bg-gray-100 flex flex-col justify-center">
      <div className="handle-bar bg-gray-400 w-1 h-16 rounded cursor-col-resize " />
    </div>
  );
};

export const PreviewPanelHandleBar = ({ targeSelector }: HandleBarProps) => {
  useResizeHandleBar(targeSelector, 'v');

  return (
    <div className="handle-bar-section flex justify-center bg-gray-100">
      <div className="handle-bar bg-gray-400 w-16 h-1 rounded cursor-row-resize " />
    </div>
  );
};
