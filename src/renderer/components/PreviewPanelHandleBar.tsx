import { Icon, IconName } from '@blueprintjs/core';
import useResizeHandleBar from '../hooks/useResizeHandleBar';

type HandleBarProps = {
  targeSelector: string;
};

/**
 * under CodeEditorPage:
 */
export const PreviewPanelHandleBar = ({ targeSelector }: HandleBarProps) => {
  const { size, switchHeightHandler } = useResizeHandleBar(targeSelector, 'v');

  const IconBySize: { [key: string]: IconName } = {
    min: 'double-chevron-up',
    max: 'double-chevron-down',
  };

  return (
    <div className="handle-bar-section flex justify-between bg-gray-100">
      <div className="w-5 h-3" />
      <div className="handle-bar bg-gray-400 w-16 h-1 my-1 rounded cursor-row-resize " />
      <button
        type="button"
        className="w-5 h-3 focus:outline-none"
        onClick={switchHeightHandler}
      >
        <Icon
          icon={IconBySize[size]}
          size={12}
          color="black"
          className="block leading-3"
        />
      </button>
    </div>
  );
};

export const TiledPanelResizeBar = ({ targeSelector }: HandleBarProps) => {
  useResizeHandleBar(targeSelector, 'h');
  return (
    <div className="handler-bar-box w-1 bg-gray-100 flex flex-col justify-center">
      <div className="handle-bar bg-gray-400 w-1 h-16 rounded cursor-col-resize " />
    </div>
  );
};
