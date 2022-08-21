import useReizeHandleBar from '../hooks/useResizeHandleBar';

type HandleBarProps = {
  targeSelector: string;
};

const PreviewPanelHandleBar = ({ targeSelector }: HandleBarProps) => {
  useReizeHandleBar(targeSelector);

  return (
    <div className="handle-bar-section flex justify-center bg-gray-100">
      <div className="handle-bar bg-gray-400 w-16 h-1 rounded cursor-row-resize " />
    </div>
  );
};

export default PreviewPanelHandleBar;
