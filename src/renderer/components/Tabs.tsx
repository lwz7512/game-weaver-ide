import clsx from 'clsx';
// import { useState } from 'react';

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
          'tab-item no-transform hover:bg-green-600',
          tabType === 'layers' ? 'border-green-600 bg-white' : ''
        )}
        onClick={() => tabChangeHandler('layers')}
      >
        Layers
      </button>
      <button
        type="button"
        className={clsx(
          'tab-item no-transform hover:bg-blue-600',
          tabType === 'history' ? 'border-blue-600 bg-white' : 'text-gray-500'
        )}
        onClick={() => tabChangeHandler('history')}
      >
        History
      </button>
    </div>
  );
};
