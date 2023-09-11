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
  const { learningContent, learningDocs, docLoadHandler } = useLearningDocs();
  return (
    <div className="w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.LEARN}
          onModuleChanged={onModuleChanged}
        />
        <div className="file-explorer bg-gray-300 w-60 p-0">
          <h1 className="text-lg bg-slate-600 m-0 p-2 text-white text-center">
            Learning Paths
          </h1>
          <ul className=" text-sm list-none text-gray-800 leading-7">
            {learningDocs.map((doc) => (
              <li
                key={doc.name}
                className={clsx('hover:bg-sky-500', doc.background)}
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
      <div className="flex-1 bg-white">
        <h1 className=" text-xl text-center p-8">Welcome to learning page!</h1>
        <div
          className="p-4 overflow-y-scroll h-4/5 markdown-container"
          dangerouslySetInnerHTML={{ __html: learningContent }}
        />
      </div>
    </div>
  );
};

export default LearningPage;
