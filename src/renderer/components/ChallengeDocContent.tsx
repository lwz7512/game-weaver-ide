// import clsx from 'clsx';
import { Button, Icon } from '@blueprintjs/core';
import { Challenge } from '../hooks/useChallenges';
import { ChallengePlayground } from './ChallengePlayground';
import appCfg from '../assets/app.json';

export const ChallengeContent = ({
  selectedChallenge,
  externalFunctions,
  openChallengeLearningPage,
}: {
  selectedChallenge: Challenge;
  externalFunctions: string;
  openChallengeLearningPage: (url: string) => void;
}) => {
  return (
    <div className="w-full ">
      {/* === header === */}
      <div className="challenge-header relative bg-slate-300 text-gray-600">
        <h1 className="text-2xl font-semibold text-center w-5/6 p-10 mt-9 text-shadow">
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
      <div className="mx-4 my-8 w-10/12 h-96 flex justify-center">
        <div className=" w-2/3 h-96 border border-gray-400 bg-slate-50">
          Video Introduction
        </div>
      </div>
      {/** === PART 2 === */}
      <div className="mx-4 my-16 h-48">
        <h2 className="text-xl underline my-8">Mission Briefing</h2>
        <p className="p-4 mx-8 my-16 text-lg border-l-4 border-green-500 pl-3 bg-gray-50 text-green-800  text-shadow-md">
          {selectedChallenge.description || 'coming soon...'}
          <br />
          {selectedChallenge.objective || 'no objective'}
        </p>
      </div>
      {/** === PART 3 === */}
      <div className="mx-4 my-8 h-48">
        <h2 className="text-xl underline my-4">Prerequisite Reading Tasks</h2>
        <ul className="py-4 px-8 text-lg ">
          {selectedChallenge.prerequsite.map((it) => (
            <li className=" leading-8 py-1" key={it.name}>
              <button
                type="button"
                title={it.title}
                className=" text-slate-500 hover:text-green-600 focus:outline-none"
                onClick={() => openChallengeLearningPage(it.url)}
              >
                👉 {it.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/** === PART 4 === */}
      <div className="mx-4 my-8 ">
        <h2 className="text-xl underline my-4">
          Checking points before Coding
        </h2>
        <div className="py-4 px-8 text-slate-500 bg-white flex flex-wrap">
          {selectedChallenge.keypoints.map((k) => (
            <div className="relative bg-slate-300 w-72 h-72 text-lg" key={k}>
              <img
                src={appCfg.baseURL + appCfg.stickyImage}
                alt="banner"
                className="absolute top-0 left-0 w-full object-cover z-0 h-full"
              />
              <p className="absolute z-0 px-14 py-20">{k}</p>
            </div>
          ))}
        </div>
      </div>
      {/** === PART 5: Coding area === */}
      <div className="mx-4 my-8 ">
        <h2 className="text-xl underline my-8">Lets Coding Now </h2>
        <ChallengePlayground
          challenge={selectedChallenge}
          editorLibSource={externalFunctions}
        />
      </div>
      {/** === PART 6 === */}
      <div className="mx-4 my-16 h-48">
        <h2 className="text-xl underline my-4">Submit Your Completion:</h2>
        <div className="button-row h-32 w-full p-8 text-center">
          <Button
            intent="success"
            color="green"
            className="finish-project-button w-44 h-14 text-2xl rounded-xl hover:drop-shadow-xl border-2 "
          >
            <Icon icon="endorsed" size={24} color="white" />
            <span className="ml-4">Done</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
