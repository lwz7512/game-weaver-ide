import clsx from 'clsx';
import LeftSideBar from '../components/LeftSideBar';
import {
  ChallengeContentHeader,
  ChalllengeItem,
  ChallengeInstructions,
  ChallengeContent,
} from '../components/ChallengeDocItem';
import { MODULETYPES } from '../config';
import useLeftSideBar from '../hooks/useLeftSideBar';
import { useChallenges } from '../hooks/useChallenges';

/**
 * Coding Challenges Module
 *
 * @2023/09/20
 *
 * @returns
 */
const ProjectsPage = () => {
  const { onModuleChanged } = useLeftSideBar();
  const {
    challenges,
    currentChallenge,
    challengeLoaded,
    openChallenge,
    goBackChallengeHome,
  } = useChallenges();

  return (
    <div className="w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.PROJECTS}
          onModuleChanged={onModuleChanged}
        />
        {/* === left panel to list all the challenges === */}
        <div className="file-explorer bg-gray-300 w-60 overflow-y-scroll">
          <h1 className=" text-lg bg-slate-600 m-0 p-4 text-white text-center">
            Challenge explorer
          </h1>
          <ul className=" text-sm list-none text-gray-800 leading-7">
            {challenges.map((doc) => (
              <ChalllengeItem
                key={doc.name}
                doc={doc}
                docLoadHandler={openChallenge}
              />
            ))}
          </ul>
        </div>
      </div>
      {/* === right part content === */}
      {/* structure may like this: */}
      {/* ######|| */}
      {/* ######|| */}
      {/* ======|| */}
      {/* ======|| */}
      <div className="flex-1 bg-white">
        {/* <h1 className="text-2xl text-center p-8 m-0 underline border-b border-gray-300 bg-sky-50">
          Welcome to challenges page!
        </h1> */}
        <ChallengeContentHeader
          isChallengeOpen={challengeLoaded}
          goWelcomeHandler={goBackChallengeHome}
        />
        <h2
          className={clsx(
            'm-12 p-4 text-slate-700 text-xl border-l-8 border-green-600 bg-gray-100 rounded-r-lg',
            challengeLoaded ? 'hidden' : ''
          )}
        >
          following these instructions to complete a mission, you will get a
          badge!
        </h2>
        <ChallengeInstructions challengeLoaded={challengeLoaded} />
        {/* === Challenge content area === */}
        {challengeLoaded && <ChallengeContent challenge={currentChallenge} />}
      </div>
    </div>
  );
};

export default ProjectsPage;
