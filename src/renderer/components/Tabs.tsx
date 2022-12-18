import clsx from 'clsx';

type LayerHistoryProps = {
  tabType: string;
  tabChangeHandler: (type: string) => void;
};

export const LayerHistoryTabs = ({
  tabType,
  tabChangeHandler,
}: LayerHistoryProps) => {
  return (
    <div className="text-base px-2 flex gap-0">
      <button
        type="button"
        className={clsx(
          'green-tab',
          tabType === 'layers' ? 'border-green-600 bg-white' : 'text-gray-500'
        )}
        onClick={() => tabChangeHandler('layers')}
      >
        Layers
      </button>
      <button
        type="button"
        className={clsx(
          'blue-tab',
          tabType === 'history' ? 'border-blue-600 bg-white' : 'text-gray-500'
        )}
        onClick={() => tabChangeHandler('history')}
      >
        History
      </button>
    </div>
  );
};
