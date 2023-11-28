/**
 * Created at @2023/09/20
 */
import { useState, useEffect, useRef } from 'react';

import { IpcEvents } from '../../ipc-events';
import {
  sourceRepo,
  TSLIB,
  MISSION_COMPLETED,
  MISSION_INCOMPLETED,
  Challenge,
} from '../config';
import { useBPToast } from './useToast';
import {
  saveChallengeCompletion,
  getCompletedChallenges,
} from '../state/storage';
import { ChallengeEvents } from '../codeRunner';

type PreLearnItem = {
  name: string;
  url: string;
  title: string;
};

const nextLevelMP3 = `${sourceRepo}assets/sound/nextLevel.mp3`;
const warningMP3 = `${sourceRepo}assets/sound/warning.mp3`;

export const useChallenges = () => {
  const { ipcRenderer } = window.electron;
  const missionSavedSound = new Audio(nextLevelMP3);
  const notCompletedSound = new Audio(warningMP3);

  /** cache all the completed challenges in memory */
  const completionsRef = useRef<number[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeLoaded, setChallengeLoaded] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(
    null
  );
  const [globalFunctions, setGlobalFunctions] = useState('');

  const { toastState, toasterCallback, addSuccessToast, addWarningToast } =
    useBPToast();

  const goBackChallengeHome = () => setChallengeLoaded(false);

  const openChallengeLearningPage = async (url: string) => {
    await ipcRenderer.invoke(IpcEvents.OPEN_EXTERNAL_URL, url);
  };

  /**
   * Click challenge item to open challenge view
   *
   * @param doc
   * @returns
   */
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

  // check, and save challenge to local cache...
  const challengeSavedHandler = () => {
    if (!currentChallenge) return;
    const { id } = currentChallenge;
    const completions = completionsRef.current;
    if (!completions.includes(id)) {
      // console.warn(`## current challenge not completed!`);
      addWarningToast(MISSION_INCOMPLETED);
      // play warning!
      notCompletedSound.play();
      return;
    }
    addSuccessToast(MISSION_COMPLETED);
    saveChallengeCompletion(currentChallenge.id);
    // play music!
    missionSavedSound.play();
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

    const completions = getCompletedChallenges();
    const challengeCompletedEnhancer = (clg: Challenge) => {
      const existing = completions.find((c) => c.id === clg.id);
      return { ...clg, completed: !!existing };
    };

    const fetchChallenges = async () => {
      const response = await fetch(`${sourceRepo}data/challenges.json`);
      const results = (await response.json()) as Challenge[];
      const bannersResp = await fetch(`${sourceRepo}data/banners.json`);
      const { challengePage } = await bannersResp.json();
      const challengesWithBanner = challengeEnhancer(results, challengePage);
      const challengesWithCompleted = challengesWithBanner.map(
        challengeCompletedEnhancer
      );
      // udpate challenge with `completed` & `bannerURL`
      setChallenges(challengesWithCompleted);
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

  /**
   * listen one challenge completed, and enable a mark on the list item
   */
  useEffect(() => {
    const challengeCompletedHandler = (evt: Event) => {
      const { detail } = evt as CustomEvent;
      const chlgCopy = challenges.map((clg) =>
        clg.id === detail ? { ...clg, completed: true } : clg
      );
      setChallenges(chlgCopy);
      // cache completed challenges, DO not update `currentChallenge`
      completionsRef.current.push(detail);
    };

    document.addEventListener(
      ChallengeEvents.MISSION_COMPLETED,
      challengeCompletedHandler
    );

    return () => {
      document.removeEventListener(
        ChallengeEvents.MISSION_COMPLETED,
        challengeCompletedHandler
      );
    };
  }, [challenges]);

  return {
    toastState,
    toasterCallback,
    challengeLoaded,
    currentChallenge,
    challenges,
    globalFunctions,
    openChallenge,
    goBackChallengeHome,
    /** open external web page by browser */
    openChallengeLearningPage,
    challengeSavedHandler,
  };
};
