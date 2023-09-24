import clsx from 'clsx';
import { Button, Card, Elevation, Intent, Icon } from '@blueprintjs/core';
import { Challenge } from '../hooks/useChallenges';

export const ChallengeContentHeader = ({
  isChallengeOpen,
  goWelcomeHandler,
}: {
  isChallengeOpen: boolean;
  goWelcomeHandler: () => void;
}) => (
  <div className="header relative w-full">
    <h1
      className={clsx(
        'm-0 text-center underline border-b border-gray-300 bg-sky-50',
        isChallengeOpen ? 'text-base p-2 ' : 'text-2xl p-8 '
      )}
    >
      Welcome to challenges page!
    </h1>
    {isChallengeOpen && (
      <button
        type="button"
        className="absolute top-2 left-1"
        onClick={goWelcomeHandler}
      >
        <Icon icon="chevron-left" size={20} color="gray" />
        <span className="text-base leading-6 text-slate-600">Back</span>
      </button>
    )}
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
      'bg-slate-500',
      'hover:bg-sky-500',
      doc.selected ? 'bg-sky-600' : ''
    )}
  >
    <button
      type="button"
      className="game-item border-b w-full inline-block py-1"
      title={doc.description}
      onClick={() => docLoadHandler(doc)}
    >
      <span className="block text-base">{doc.name}</span>
      <span className=" text-base">
        {new Array(doc.level).fill(0).map(() => `🌟`)}
      </span>
    </button>
  </li>
);

export const ChallengeContent = ({
  challenge,
}: {
  challenge: Challenge | null;
}) => {
  return (
    <div className="p-4">
      <h1 className=" text-lg">{challenge?.name}</h1>
    </div>
  );
};

export const ChallengeInstructions = ({
  challengeLoaded,
}: {
  challengeLoaded: boolean;
}) => (
  <ul
    className={clsx(
      'm-12 p-4 text-slate-700 text-lg leading-10',
      challengeLoaded ? 'hidden' : ''
    )}
  >
    <li className=" underline">
      👉 Step 1: Select one challenge from left side list to get started.
    </li>
    <li className=" underline">
      👉 Step 2: Watch the introduction video, understand the mission of current
      challenge.
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
);
