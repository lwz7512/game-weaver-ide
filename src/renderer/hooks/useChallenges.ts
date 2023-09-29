/**
 * Created at @2023/09/20
 */
import { useState } from 'react';
import allChallenges from '../assets/challenges.json';

export type Challenge = {
  id: number;
  name: string;
  description: string;
  objective: string;
  keywords: string[];
  prerequsite: string;
  reference: string;
  videoURL: string;
  level: number;
  expect: string;
  finalCode: string;
  selected?: boolean;
};

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>(allChallenges);
  const [challengeLoaded, setChallengeLoaded] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(
    null
  );

  const openChallenge = (doc: Challenge) => {
    setChallengeLoaded(true);
    if (doc.id === currentChallenge?.id) return;
    // change selection
    const challengesCopy = challenges.map((clg) => ({
      ...clg,
      selected: clg.id === doc.id,
    }));
    setChallenges(challengesCopy);
    setCurrentChallenge(doc);
  };

  const goBackChallengeHome = () => setChallengeLoaded(false);

  //
  return {
    challengeLoaded,
    currentChallenge,
    challenges,
    openChallenge,
    goBackChallengeHome,
  };
};
