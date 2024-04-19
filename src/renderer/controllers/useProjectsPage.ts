/**
 * Created at @2023/09/20
 */
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { IpcEvents } from '../../ipc-events';
import { sourceRepo, TSLIB, Challenge } from '../config';
import { useBPToast } from '../hooks/useToast';
import { getCompletedChallenges } from '../state/storage';
import { ChallengeEvents } from '../helpers/codeRunner';

export const useChallenges = () => {
  const { ipcRenderer } = window.electron;

  const [params] = useSearchParams();
  const navigate = useNavigate();

  /** cache all the completed challenges in memory */
  const completionsRef = useRef<number[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [globalFunctions, setGlobalFunctions] = useState('');

  const { toastState, toasterCallback, addWarningToast } = useBPToast();

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
    navigate(`/challenge/${doc.id}`, { state: doc });

    // FIXME: reset project page to top
    setTimeout(() => scrollContentBy(0));
  };

  // fetching remote challenges data
  useEffect(() => {
    /**
     * Add random banner path & cover url to challenge obj
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
      // FIXME: udpate challenge with `completed` & `bannerURL`
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

  /**
   * listen one challenge completed, and enable a mark on the list item
   */
  useEffect(() => {
    if (!challenges.length) return;

    // FIXME: open the last challenge from welcome page
    // DO NOT reset `challenges` or cause dead-loop rendering!
    // @2024/03/04
    const challengeId = params.get('challengeId');
    if (!challengeId) return;

    const doc = challenges.find((c) => c.id === Number(challengeId));
    if (!doc) return;

    navigate(`/challenge/${doc.id}`, { state: doc });
  }, [challenges, params, navigate]);

  return {
    toastState,
    toasterCallback,
    challenges,
    globalFunctions,
    openChallenge,
    /** open external web page by browser */
    openChallengeLearningPage,
    scrollToChallengeSection,
  };
};
