/**
 * Created at @2023/09/20
 */
import { useState, useEffect } from 'react';

import { IpcEvents } from '../../ipc-events';

import { sourceRepo, TSLIB } from '../config';

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
  /** video introduction path to this challenge */
  videoURL: string;
  /** video subtitle path with English/Chinse version  */
  videoSubtitle: string;
  /** learning task before start coding */
  prerequsite: PreLearnItem[];
  /** base code */
  baseCode: string;
  /** coding start point loaded from remote repository */
  startCode: string;
  /** code testing method or code auditor function defined in challenges.js */
  testCode: string;
  /** code snippet for challenge completion */
  finalCode: string;
  /** if current challenge is in use */
  selected?: boolean;
  /** banner image path */
  bannerURL?: string;
};

export const useChallenges = () => {
  const { ipcRenderer } = window.electron;

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeLoaded, setChallengeLoaded] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(
    null
  );
  const [globalFunctions, setGlobalFunctions] = useState('');

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
    // FIXME: reset project page to top
    setTimeout(() => {
      const scrollable = document.querySelector('.project-content');
      scrollable?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const goBackChallengeHome = () => setChallengeLoaded(false);

  const openChallengeLearningPage = async (url: string) => {
    await ipcRenderer.invoke(IpcEvents.OPEN_EXTERNAL_URL, url);
  };

  // fetching remote challenges data
  useEffect(() => {
    /**
     * Add random banner path to challenge
     * @param clgs
     * @param bannerPaths
     * @returns
     */
    const challengeEnhancer = (
      clgs: Challenge[],
      bannerPaths: string[]
    ): Challenge[] => {
      return clgs.map((clg) => {
        const randomBannerIndex = Math.floor(
          Math.random() * bannerPaths.length
        );
        const bannerURL = sourceRepo + bannerPaths[randomBannerIndex];
        return { ...clg, bannerURL };
      });
    };

    const fetchChallenges = async () => {
      const response = await fetch(`${sourceRepo}data/challenges.json`);
      const results = (await response.json()) as Challenge[];
      const bannersResp = await fetch(`${sourceRepo}data/banners.json`);
      const { challengePage } = await bannersResp.json();
      const challengesWithBanner = challengeEnhancer(results, challengePage);
      setChallenges(challengesWithBanner);
    };
    // load challenges ....
    fetchChallenges();

    const fetchLibCode = async () => {
      // const r = `?r=${Math.random()}`;
      const response = await fetch(sourceRepo + TSLIB.GLOBAL);
      const source = await response.text();
      // console.log(source);
      setGlobalFunctions(source);
    };
    // load challenge interface functions available to user ...
    fetchLibCode();
  }, []);

  return {
    challengeLoaded,
    currentChallenge,
    challenges,
    globalFunctions,
    openChallenge,
    goBackChallengeHome,
    /** open external web page by browser */
    openChallengeLearningPage,
  };
};
