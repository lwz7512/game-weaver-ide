/**
 * Created at 2023/09/29
 */
import clsx from 'clsx';
import { IconName, Icon } from '@blueprintjs/core';
import { CHALLENGES_WELCOME } from '../config/labels';
import { Challenge, sourceRepo } from '../config';

export type ChallengeModuleType = {
  icon: IconName;
  label: string;
  clickHandler: () => void;
};

export const challengeModules: ChallengeModuleType[] = [
  { icon: 'video', label: 'Video Intro', clickHandler: () => null },
  { icon: 'locate', label: 'Mission possible', clickHandler: () => null },
  { icon: 'learning', label: 'Prerequisites', clickHandler: () => null },
  { icon: 'code', label: 'Coding & Run', clickHandler: () => null },
  {
    icon: 'confirm',
    label: 'Challenge Acknowledged',
    clickHandler: () => null,
  },
];

export const ChallengeContentHeader = ({
  isChallengeOpen,
  goWelcomeHandler,
}: {
  isChallengeOpen: boolean;
  goWelcomeHandler: () => void;
}) => (
  <div
    className={clsx(
      'challenge-home-header w-full fixed z-20',
      isChallengeOpen ? 'bg-none bg-slate-500' : 'bg-image'
    )}
  >
    <h1
      className={clsx(
        'm-0 border-b border-gray-300 text-white cursor-default',
        isChallengeOpen
          ? 'text-base p-2 pl-24'
          : 'text-3xl p-8 pl-72 text-shadow-md text-slate-700 font-semibold'
      )}
    >
      {CHALLENGES_WELCOME}
    </h1>
    {isChallengeOpen && (
      <button
        type="button"
        className="absolute top-2 left-1"
        onClick={goWelcomeHandler}
      >
        <Icon icon="chevron-left" size={20} color="orange" />
        <span className="text-base leading-6 text-slate-300">Back</span>
      </button>
    )}
  </div>
);

const ChallengeModuleItem = ({
  icon,
  label,
  clickHandler,
}: ChallengeModuleType) => (
  <li className="p-2 border-b border-slate-300 hover:bg-white">
    <button
      type="button"
      className="text-gray-600 hover:text-green-600 focus:outline-none flex align-middle w-full"
      onClick={clickHandler}
    >
      <Icon icon={icon} size={24} color="currentColor" className="mr-2 " />
      <span className=" inline-block">{label}</span>
    </button>
  </li>
);

export const SideFixeModules = () => (
  <ul className="slidein-right-menu bg-yellow-50 border-l border-gray-300 drop-shadow text-sm z-20">
    {challengeModules.map((module) => (
      <ChallengeModuleItem
        key={module.label}
        icon={module.icon}
        label={module.label}
        clickHandler={() => null}
      />
    ))}
  </ul>
);

export const ChallengeInstructions = ({
  challengeLoaded,
}: {
  challengeLoaded: boolean;
}) => (
  <div className={clsx('px-2', challengeLoaded ? 'hidden' : '')}>
    <ul className="mx-12 px-4 py-2 text-slate-700 text-lg leading-10">
      <li className=" underline">
        👉 Step 1: Select one challenge from left side list to get started.
      </li>
      <li className=" underline">
        👉 Step 2: Watch the introduction video, understand the mission of
        current challenge.
      </li>
      <li className=" underline">
        👉 Step 3: Check the reference tutorial or document, learn the related
        concepts or methods.
      </li>
      <li className=" underline">
        👉 Step 4: Use your newly learned knoledges to write mission required
        code.
      </li>
      <li className=" underline">
        👉 Step 5: Test your code with trial and error approach, until your
        mission completed.
      </li>
      <li className=" underline">
        👉 Step 6: Accept your achievement, and go on to the next challenge!
      </li>
    </ul>
    <img
      src={`${sourceRepo}images/challenge_steps.png`}
      alt="challenge-steps"
      className="w-5/6 h-auto my-4 mx-8"
    />
  </div>
);

export const ChalllengeItem = ({
  doc,
  docLoadHandler,
}: {
  doc: Challenge;
  docLoadHandler: (doc: Challenge) => void;
}) => (
  <li
    key={doc.name}
    className={clsx(
      'hover:bg-sky-600',
      doc.selected ? 'bg-sky-600' : 'bg-sky-800'
    )}
  >
    <button
      type="button"
      className="game-item border-b w-full inline-block py-1"
      title={doc.description}
      onClick={() => docLoadHandler(doc)}
    >
      <span className="block text-base">{doc.name}</span>
      <div className="flex justify-between">
        <span className="level text-base">
          {new Array(doc.level).fill(0).map(() => `⭐ `)}
        </span>
        {doc.completed && <Icon icon="endorsed" size={18} color="yellow" />}
      </div>
    </button>
  </li>
);
