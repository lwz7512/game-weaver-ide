/**
 * Created at @2023/09/20
 */
import { useState, useEffect, useRef } from 'react';

import { IpcEvents } from '../../ipc-events';
import {
  sourceRepo,
  TSLIB,
  MISSION_INCOMPLETED,
  Challenge,
  MISSION_MARK_COMPLETED,
  NO_TEST_CASES,
} from '../config';
import { useBPToast } from './useToast';
import {
  saveChallengeCompletion,
  getCompletedChallenges,
} from '../state/storage';
import { ChallengeEvents } from '../helpers/codeRunner';

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

  const goBackChallengeHome = () => {
    setChallengeLoaded(false);
  };

  const openChallengeLearningPage = async (url: string) => {
    await ipcRenderer.invoke(IpcEvents.OPEN_EXTERNAL_URL, url);
  };

  const scrollContentBy = (offset: number) => {
    const scrollable = document.querySelector('.project-content');
    scrollable?.scrollTo({ top: offset, behavior: 'smooth' });
  };

  const scrollToChallengeSection = (sectionCode: string) => {
    const sections: { [code: string]: number } = {
      V: 0, // video
      M: 500, // mission
      P: 800, // prerequisite
      C: 1400, // coding
      S: 1600, // save
    };
    scrollContentBy(sections[sectionCode]);
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
    setTimeout(() => scrollContentBy(0));
  };

  /**
   * Save `completed` challenge to local cache
   * @returns
   */
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
    addSuccessToast(MISSION_MARK_COMPLETED);
    saveChallengeCompletion(currentChallenge.id);
    // play music!
    missionSavedSound.play();
  };

  const chanllengeWarningHandler = (message: string) => {
    addWarningToast(message);
    notCompletedSound.play();
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
        // Add cover url from `cover` property at 2024/01/28
        const coverURL = sourceRepo + clg.cover;
        return { ...clg, bannerURL, coverURL };
      });
    };

    const completions = getCompletedChallenges();
    const challengeCompletedEnhancer = (clg: Challenge) => {
      const completedChallenge = completions.find(
        (c) => c.id === clg.id && c.status === 'completed'
      );
      const touchedChallenge = completions.find(
        (c) => c.id === clg.id && c.status === 'touched'
      );
      // get challenge with properties `completed` & `touched`
      return {
        ...clg,
        completed: !!completedChallenge,
        touched: !!touchedChallenge,
      };
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
      // lazy udpate for better UE
      // @2023/11/30
      setTimeout(() => setChallenges(challengesWithCompleted), 300);
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
        clg.id === detail ? { ...clg, completed: true, touched: false } : clg
      );
      setChallenges(chlgCopy);
      // NOTE: cache completed challenges, RATHER THAN update `currentChallenge`
      // Update `currentChallenge` will cause challenge content rerender unnecessaryly!
      // @2023/12/05
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
    chanllengeWarningHandler,
    scrollToChallengeSection,
  };
};
