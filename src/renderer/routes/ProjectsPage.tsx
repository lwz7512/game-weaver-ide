import clsx from 'clsx';
// import { Icon } from '@blueprintjs/core';
import LeftSideBar from '../components/LeftSideBar';
import { ChallengeContent } from '../components/ChallengeDocContent';
import {
  ChalllengeItem,
  ChallengeInstructions,
  ChallengeContentHeader,
  SideFixeModules,
} from '../components/ChallengeModules';
import { MODULETYPES, CHALLENGE_AWARD_SLOGAN } from '../config';
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
    globalFunctions,
    openChallenge,
    goBackChallengeHome,
    openChallengeLearningPage,
  } = useChallenges();

  return (
    <div className="w-full h-screen flex relative">
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
      <div className="project-content flex-1 bg-white overflow-y-scroll">
        <ChallengeContentHeader
          isChallengeOpen={challengeLoaded}
          goWelcomeHandler={goBackChallengeHome}
        />
        {/* fixed right menu */}
        {challengeLoaded && <SideFixeModules />}
        <h2
          className={clsx(
            'm-12 mt-36 p-4 text-slate-700 text-xl border-l-8 border-green-600 bg-gray-100 rounded-r-lg',
            challengeLoaded ? 'hidden' : ''
          )}
        >
          {CHALLENGE_AWARD_SLOGAN}
        </h2>
        <ChallengeInstructions challengeLoaded={challengeLoaded} />
        {/* === Challenge content area === */}
        {challengeLoaded && currentChallenge && (
          <ChallengeContent
            selectedChallenge={currentChallenge}
            externalFunctions={globalFunctions}
            openChallengeLearningPage={openChallengeLearningPage}
          />
        )}
      </div>
      {/* floating webview - 2023/10/02 */}
      {/* <WebDocViewer /> */}
    </div>
  );
};

export default ProjectsPage;
