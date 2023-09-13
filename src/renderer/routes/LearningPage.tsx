import { Button, Card, Elevation, Intent, Icon } from '@blueprintjs/core';
import clsx from 'clsx';
import LeftSideBar from '../components/LeftSideBar';
import useLeftSideBar from '../hooks/useLeftSideBar';
import { MODULETYPES } from '../config';
import { useLearningDocs } from '../hooks/useLearningDocs';

/**
 * Tutorial and Docs
 *
 * @returns
 */
const LearningPage = () => {
  const { onModuleChanged } = useLeftSideBar();
  const {
    learningContent,
    learningDocs,
    isWVFullscreen,
    closeFullscreenGameHandler,
    docLoadHandler,
    markdownLinkHandler,
    openDocBy,
  } = useLearningDocs();

  return (
    <div className="w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.LEARN}
          onModuleChanged={onModuleChanged}
        />
        {/* === left panel === */}
        <div className="file-explorer bg-gray-300 w-60 p-0">
          <h1 className="text-lg bg-slate-600 m-0 p-2 text-white text-center">
            Learning Paths
          </h1>
          <ul className=" text-sm list-none text-gray-800 leading-7">
            {learningDocs.map((doc) => (
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
            ))}
          </ul>
        </div>
      </div>
      {/* === right panel === */}
      <div className="flex-1 bg-slate-50 ">
        <div className="header relative w-full">
          <h1 className="m-0 text-2xl text-center underline p-8 border-b border-gray-300 bg-sky-50">
            Welcome to learning page!
          </h1>
          {isWVFullscreen && (
            <button
              type="button"
              className="absolute top-0 right-1"
              onClick={closeFullscreenGameHandler}
            >
              <Icon icon="chevron-left" size={20} color="gray" />
              <span className="text-base leading-6 text-gray-600">Back</span>
            </button>
          )}
        </div>

        {/* learning doc cards */}
        <div className="card-list flex flex-wrap gap-6 p-4">
          {learningDocs.map((doc) => (
            <Card
              key={doc.id}
              interactive
              elevation={Elevation.TWO}
              className={clsx('w-56 h-60 border', doc.border)}
            >
              <span
                className={clsx('border-b-4 inline-block w-8', doc.border)}
              />
              <h1 className="text-lg font-semibold h-14">{doc.name}</h1>
              <p className="block w-full h-24 py-2">{doc.description}</p>
              <Button
                intent={doc.theme as Intent}
                onClick={() => openDocBy(doc.id)}
              >
                Read
              </Button>
            </Card>
          ))}
        </div>
        {/* learning content from remot */}
        <div
          role="note"
          className="p-4 overflow-y-scroll h-4/5 markdown-container"
          dangerouslySetInnerHTML={{ __html: learningContent }}
          onKeyDown={() => null}
          onClick={markdownLinkHandler}
        />
      </div>
    </div>
  );
};

export default LearningPage;
