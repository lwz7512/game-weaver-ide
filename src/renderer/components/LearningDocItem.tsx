import clsx from 'clsx';
import { Button, Card, Elevation, Intent, Icon } from '@blueprintjs/core';
import { LearningDoc } from '../hooks/useLearningDocs';

export const LearningDocHeader = ({
  content,
  isWVFullscreen,
  closeWebpageHandler,
}: {
  content: string;
  isWVFullscreen: boolean;
  closeWebpageHandler: () => void;
}) => (
  <div className="header relative w-full">
    <h1
      className={clsx(
        'm-0 text-center underline border-b border-gray-300',
        content ? 'text-base p-2 ' : 'text-2xl p-8 ',
        isWVFullscreen ? 'bg-black' : 'bg-sky-50'
      )}
    >
      Welcome to learning page!
    </h1>
    {isWVFullscreen && (
      <button
        type="button"
        className="absolute top-2 right-1"
        onClick={closeWebpageHandler}
      >
        <Icon icon="chevron-left" size={20} color="green" />
        <span className="text-base leading-6 text-green-400">Back</span>
      </button>
    )}
  </div>
);

export const DocButtonInList = ({
  doc,
  docLoadHandler,
}: {
  doc: LearningDoc;
  docLoadHandler: (name: string, url: string) => void;
}) => (
  <li
    key={doc.name}
    className={clsx(
      'bg-slate-500',
      'hover:bg-sky-500',
      doc.selected ? 'bg-sky-600' : ''
    )}
  >
    <button
      type="button"
      className="game-item inline-block border-b w-full"
      title={doc.title}
      onClick={() => docLoadHandler(doc.name, doc.url)}
    >
      {doc.name}
    </button>
  </li>
);

export const DocCardInList = ({
  content,
  doc,
  openDocHandler,
}: {
  content: string;
  doc: LearningDoc;
  openDocHandler: (id: number) => void;
}) => (
  <Card
    key={doc.id}
    interactive
    elevation={Elevation.TWO}
    className={clsx(
      'w-56 border border-red-600',
      doc.border,
      content ? 'h-32 px-2 py-0' : 'h-60'
    )}
  >
    <span
      className={clsx('border-b-4 inline-block w-8 border-red-600', doc.border)}
    />
    <h1
      className={clsx('font-semibold h-14', content ? 'text-base' : 'text-lg')}
    >
      {doc.name}
    </h1>
    <p className={clsx('w-full h-24 py-2', content ? 'hidden' : 'block ')}>
      {doc.description}
    </p>
    <Button intent={doc.theme as Intent} onClick={() => openDocHandler(doc.id)}>
      Read
    </Button>
  </Card>
);
