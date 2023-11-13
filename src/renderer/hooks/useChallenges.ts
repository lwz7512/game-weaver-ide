/**
 * Created at @2023/09/20
 */
import { useState, useEffect } from 'react';

import { IpcEvents } from '../../ipc-events';

import { sourceRepo } from '../config';

type PreLearnItem = {
  name: string;
  url: string;
  title: string;
};

export type Challenge = {
  /** challenge number */
  id: number;
  /** challenge name */
  name: string;
  /** challenge description */
  description: string;
  /** challenge target */
  objective: string;
  /** challenge knowledge points */
  keywords: string[];
  /** problems to be solved before coding */
  keypoints: string[];
  /** difficulty degree */
  level: number;
  /** video introduction to this challenge */
  videoURL: string;
  /** learning task before start coding */
  prerequsite: PreLearnItem[];
  /** coding start point loaded from remote repository */
  startCode: string;
  /** code testing method or code auditor function defined in challenges.js */
  testCode: string;
  /** code snippet for challenge completion */
  finalCode: string;
  /** if current challenge is in use */
  selected?: boolean;
};

export const useChallenges = () => {
  const { ipcRenderer } = window.electron;

  const [challenges, setChallenges] = useState<Challenge[]>([]);
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

  // fetching remote challenges data
  useEffect(() => {
    const fetchChallenges = async () => {
      const response = await fetch(`${sourceRepo}data/challenges.json`);
      const results = await response.json();
      setChallenges(results);
    };
    fetchChallenges();
  }, []);

  return {
    challengeLoaded,
    currentChallenge,
    challenges,
    openChallenge,
    goBackChallengeHome,
    /** open external web page by browser */
    openChallengeLearningPage,
  };
};
