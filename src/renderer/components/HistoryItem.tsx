import clsx from 'clsx';
import { SaveHistory } from '../config';

type HistoryProps = {
  item: SaveHistory;
  selectedMap: string | null;
  clickHandler: (name: string, path: string) => void;
};

export const HistoryItem = ({
  item,
  selectedMap,
  clickHandler,
}: HistoryProps) => (
  <li className="layer-item">
    <button
      type="button"
      className={clsx(
        'map-history-item no-transform',
        item.name === selectedMap ? 'bg-blue-500 text-white' : 'bg-white'
      )}
      onClick={() => clickHandler(item.name, item.path)}
    >
      {item.name}
    </button>
  </li>
);
