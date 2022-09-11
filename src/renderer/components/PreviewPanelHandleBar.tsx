import { Icon, IconName } from '@blueprintjs/core';
import useResizeHandleBar from '../hooks/useResizeHandleBar';

type HandleBarProps = {
  targeSelector: string;
};

type PreviewHandleBarProps = HandleBarProps & {
  onFullScreen?: () => void;
};

/**
 * under CodeEditorPage:
 */
export const PreviewPanelHandleBar = ({
  targeSelector,
  onFullScreen,
}: PreviewHandleBarProps) => {
  const { size, switchHeightHandler } = useResizeHandleBar(
    targeSelector,
    'v',
    false
  );

  const IconBySize: { [key: string]: IconName } = {
    min: 'double-chevron-up',
    max: 'double-chevron-down',
  };

  return (
    <div className="handle-bar-section flex justify-between bg-gray-200">
      <div className="w-5 h-3" />
      <button
        type="button"
        className="w-3 h-3 focus:outline-none hover:bg-white"
        onClick={switchHeightHandler}
      >
        <Icon
          icon={IconBySize[size]}
          size={12}
          color="black"
          className="block leading-3"
        />
      </button>
      <button
        type="button"
        className="mx-1 w-3 h-3 focus:outline-none hover:bg-white"
        onClick={onFullScreen}
      >
        <Icon
          icon="fullscreen"
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
    <div className="handle-bar-section w-1 bg-gray-100 flex flex-col justify-center">
      <div className="handle-bar bg-gray-400 w-1 h-16 rounded cursor-col-resize " />
    </div>
  );
};
