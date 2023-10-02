/**
 * Created at @2023/09/20
 */
import { useState } from 'react';
import allChallenges from '../assets/challenges.json';
import { IpcEvents } from '../../ipc-events';

type PreLearnItem = {
  name: string;
  url: string;
  title: string;
};

export type Challenge = {
  id: number;
  name: string;
  description: string;
  objective: string;
  keywords: string[];
  keypoints: string[];
  prerequsite: PreLearnItem[];
  reference: string;
  videoURL: string;
  level: number;
  expect: string;
  finalCode: string;
  selected?: boolean;
};

export const useChallenges = () => {
  const { ipcRenderer } = window.electron;

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

  const openChallengeLearningPage = async (url: string) => {
    await ipcRenderer.invoke(IpcEvents.OPEN_EXTERNAL_URL, url);
  };

  return {
    challengeLoaded,
    currentChallenge,
    challenges,
    openChallenge,
    goBackChallengeHome,
    openChallengeLearningPage,
  };
};
