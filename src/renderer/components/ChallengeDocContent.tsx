import clsx from 'clsx';
import { Icon } from '@blueprintjs/core';
import { Challenge } from '../hooks/useChallenges';
import { ChallengePlayground } from './ChallengePlayground';
import { ChallengeModuleItem, challengeModules } from './ChallengeModules';

export const ChallengeContent = ({
  selectedChallenge,
}: {
  selectedChallenge: Challenge;
}) => {
  return (
    <div className="w-full ">
      {/* === header === */}
      <div className="challenge-header relative bg-slate-500 text-white">
        <h1 className="text-2xl text-center w-5/6 p-10 mt-9">
          {selectedChallenge.name}
        </h1>
        {/* keywords */}
        <ul className="flex text-base gap-3 absolute bottom-4 right-16">
          {selectedChallenge.keywords.map((word) => (
            <li className="px-3 py-0 border border-green-800 bg-green-500 text-white rounded-xl">
              {word}
            </li>
          ))}
        </ul>
        {/* fixed right menu */}
        <ul className="slidein-right-menu bg-yellow-50 border-l border-gray-300 drop-shadow text-sm">
          {challengeModules.map((module) => (
            <ChallengeModuleItem
              key={module.label}
              icon={module.icon}
              label={module.label}
              clickHandler={() => null}
            />
          ))}
        </ul>
      </div>
      {/* === challenge content === */}
      <div className="mx-4 my-8 w-10/12 h-96 flex justify-center">
        <div className=" w-2/3 h-96 border border-gray-400 bg-slate-50">
          Video Introduction
        </div>
      </div>
      <div className="mx-4 my-16">
        <h2 className="text-xl underline my-8">Mission Briefing</h2>
        <p className="p-4 mx-8 text-lg border-l-4 border-green-500 pl-3 bg-gray-50 text-green-800  text-shadow-md">
          {selectedChallenge.description || 'coming soon...'}
          <br />
          {selectedChallenge.objective || 'no objective'}
        </p>
      </div>
      <div className="mx-4 my-8 h-16">
        <h2 className="text-xl underline my-4">Prerequisites Part</h2>
      </div>
      <div className="mx-4 my-8 h-96 ">
        <h2 className="text-xl underline my-4">Coding Part </h2>
        <ChallengePlayground />
      </div>
      <div className="mx-4 my-16 h-16">
        <h2 className="text-xl underline my-4">Submit Part</h2>
      </div>
    </div>
  );
};
