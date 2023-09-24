import clsx from 'clsx';
import LeftSideBar from '../components/LeftSideBar';
import {
  DocButtonInList,
  DocCardInList,
  LearningDocHeader,
} from '../components/LearningDocItem';
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
          <h1 className="text-lg bg-slate-600 m-0 p-4 text-white text-center">
            Learning Paths
          </h1>
          <ul className=" text-sm list-none text-gray-800 leading-7">
            {learningDocs.map((doc) => (
              <DocButtonInList
                key={doc.name}
                doc={doc}
                docLoadHandler={docLoadHandler}
              />
            ))}
          </ul>
        </div>
      </div>
      {/* === right panel === */}
      <div className="flex-1 bg-slate-50 ">
        <LearningDocHeader
          content={learningContent}
          isWVFullscreen={isWVFullscreen}
          closeWebpageHandler={closeFullscreenGameHandler}
        />
        {/* learning doc cards */}
        <div
          className={clsx(
            'card-list flex flex-wrap gap-6 p-4',
            isWVFullscreen ? 'bg-black' : ''
          )}
        >
          {learningDocs.map((doc) => (
            <DocCardInList
              key={doc.name}
              content={learningContent}
              doc={doc}
              openDocHandler={docLoadHandler}
            />
          ))}
        </div>
        {/* learning content from remot */}
        <div
          role="note"
          className={clsx(
            'p-4 pr-14 overflow-y-scroll h-3/4 markdown-container',
            isWVFullscreen ? 'bg-black' : ''
          )}
          dangerouslySetInnerHTML={{ __html: learningContent }}
          onKeyDown={() => null}
          onClick={markdownLinkHandler}
        />
      </div>
    </div>
  );
};

export default LearningPage;
