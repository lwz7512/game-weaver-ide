/**
 * Challenge details page
 * @date 2024/04/16
 */

import clsx from 'clsx';

import { Button, Icon, Toaster } from '@blueprintjs/core';

import { ChallengePlayground } from '../components/ChallengePlayground';
import { ChallengeContentHeader } from '../components/ChallengeModules';
import appCfg from '../assets/app.json';
import { useChallengePage } from '../controllers/useChallengePage';

const ChallengePage = () => {
  const {
    challengeWarningHandler,
    goBackChallengeHome,
    challengeSavedHandler,
    toggleSubTitle,
    toasterCallback,
    selectedChallenge,
    showSubTitle,
    globalFunctions,
    subtitle,
    toastState,
  } = useChallengePage();

  return (
    <div className="challenges-page w-full h-screen relative overflow-y-scroll">
      <ChallengeContentHeader
        isChallengeOpen
        goWelcomeHandler={goBackChallengeHome}
      />
      {/* === header === */}
      <div className="challenge-content-header relative bg-slate-300 ">
        <h1
          className="object-cover text-gray-700 text-3xl font-semibold text-center w-full p-12 mt-9 text-shadow"
          style={{ backgroundImage: `url(${selectedChallenge.bannerURL})` }}
        >
          {selectedChallenge.name}
        </h1>
        {/* keywords */}
        <ul className="flex text-base gap-3 absolute bottom-4 right-16">
          {selectedChallenge.keywords.map((word) => (
            <li
              key={word}
              className="px-3 py-0 border border-green-200 bg-green-500 text-white rounded-xl"
            >
              {word}
            </li>
          ))}
        </ul>
      </div>
      {/* === challenge content: PART 1 === */}
      <div className="mx-4 my-10 h-96 relative">
        <div className="video-and-subtitle-row w-full flex">
          {/* place holder */}
          <div className={clsx('left-box ', showSubTitle ? '' : 'flex-1')} />
          {/* center video */}
          <div className="w-1/2 h-96 border border-gray-400 bg-slate-600 text-white overflow-hidden">
            {/* <h2 className="p-1 text-base">Video Introduction</h2> */}
            <img
              src={selectedChallenge.coverURL}
              alt="video-cover"
              className=" w-full h-auto object-cover pt-1"
            />
            {/* TODO: add video tag after all the content done! - 2024/01/28 */}
          </div>
          {/* markdown subtitle content */}
          {showSubTitle ? (
            <div
              className="markdown-container h-96 flex-1 px-4 py-1 bg-slate-100 border border-gray-400 overflow-y-scroll w-1/3"
              dangerouslySetInnerHTML={{ __html: subtitle }}
            />
          ) : (
            <div className="h-96 flex-1 px-2 py-1 w-1/4" />
          )}
        </div>
        {/* add video subtitles tab and content loaded from remote md file */}
        <div
          className={clsx(
            'absolute z-10 bottom-0 flex justify-end py-2 px-4',
            showSubTitle ? 'w-1/2' : 'w-3/4'
          )}
        >
          <button
            type="button"
            className=" text-xs text-black hover:underline focus:outline-none"
            onClick={toggleSubTitle}
          >
            SUBTITLE
          </button>
        </div>
      </div>
      {/** === PART 2: Mission Briefing === */}
      <div className="mx-4 my-16 h-48 px-2">
        <h2 className="text-xl underline my-8">Mission Briefing</h2>
        <p className="p-4 mx-8 my-16 text-lg border-l-4 border-green-500 pl-3 bg-gray-50 text-green-800  text-shadow-md">
          {selectedChallenge.description || 'coming soon...'}
          <br />
          {selectedChallenge.objective || 'no objective'}
        </p>
      </div>
      {/** === PART 3: References & Tutorials === */}
      <div className="mx-4 my-8 px-2">
        <h2 className="text-xl underline my-4">Prerequisite Reading Tasks</h2>
        <ul className="py-4 px-8 text-lg ">
          {selectedChallenge.prerequisite.map((it) => (
            <li className=" leading-8 py-1" key={it.name}>
              <button
                type="button"
                title={it.title}
                className=" text-slate-500 hover:text-green-600 focus:outline-none"
                onClick={() => console.log(`TODO:`)}
              >
                👉 {it.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/** === PART 4: Questions before coding === */}
      <div className="mx-4 my-8 px-2">
        <h2 className="text-xl underline my-4">
          Checking points before Coding
        </h2>
        <div className="py-4 px-8 text-slate-500 bg-white flex flex-wrap gap-2">
          {selectedChallenge.keypoints.map((k) => (
            <div className="relative  w-72 h-72 text-lg" key={k}>
              <img
                src={appCfg.baseURL + appCfg.stickyImage}
                alt="banner"
                className="absolute top-0 left-0 w-full object-cover z-0 h-full opacity-80"
              />
              <p className="absolute z-0 px-14 py-20 text-lg font-semibold">
                {k}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/** === PART 5: Coding area === */}
      <div className="mx-4 my-8 px-2">
        <h2 className="text-xl underline my-8">Lets Coding Now </h2>
        <ChallengePlayground
          challenge={selectedChallenge}
          editorLibSource={globalFunctions}
          warningHandler={challengeWarningHandler}
        />
      </div>
      {/** === PART 6 === */}
      <div className="mx-4 my-16 h-48 px-2">
        <h2 className="text-xl underline my-4">Save Your Achievement:</h2>
        <div className="button-row h-32 w-full p-8 flex  mt-20">
          <div className="left-part flex-1 px-6 flex justify-end">
            <span className="border-b border-gray-400 w-44 h-1 p-3" />
          </div>
          <Button
            intent="success"
            color="green"
            disabled={selectedChallenge.completed}
            className="finish-project-button w-44 h-14 text-2xl rounded-xl hover:drop-shadow-xl border-2 "
            onClick={challengeSavedHandler}
          >
            <Icon icon="endorsed" size={24} color="white" />
            <span className="ml-4">Done</span>
          </Button>
          <div className="left-part flex-1 px-6 flex justify-start">
            <span className="border-b border-gray-400 w-44 h-1 p-3" />
          </div>
        </div>
      </div>
      {/* end of challenge content */}
      {/* toaster */}
      <Toaster {...toastState} ref={toasterCallback} />
    </div>
  );
};

export default ChallengePage;
