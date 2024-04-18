/**
 * Created
 *
 * @date 2024/04/16
 */

import { useState, useEffect, useRef } from 'react';
import MarkdownIt from 'markdown-it';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
// import appCfg from '../assets/app.json';
import {
  sourceRepo,
  Challenge,
  TSLIB,
  ROUTES,
  MISSION_MARK_COMPLETED,
  MISSION_INCOMPLETED,
} from '../config';
import { useBPToast } from '../hooks/useToast';

import { saveChallengeCompletion } from '../state/storage';

export const useChallengePage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const completionsRef = useRef<(number | string)[]>([]);
  const [subtitle, setSubtitle] = useState('');
  const [showSubTitle, setshowSubTitle] = useState(false);
  const [globalFunctions, setGlobalFunctions] = useState('');

  const toggleSubTitle = () => setshowSubTitle(!showSubTitle);

  const selectedChallenge = state as Challenge;

  const nextLevelMP3 = `${sourceRepo}assets/sound/nextLevel.mp3`;
  const warningMP3 = `${sourceRepo}assets/sound/warning.mp3`;
  const notCompletedSound = new Audio(warningMP3);
  const missionSavedSound = new Audio(nextLevelMP3);

  const { addWarningToast, addSuccessToast, toastState, toasterCallback } =
    useBPToast();

  const challengeWarningHandler = (message: string) => {
    addWarningToast(message);
    notCompletedSound.play();
  };

  const goBackChallengeHome = () => {
    const challengeRoute = ROUTES.PROJECTS;
    navigate(challengeRoute);
  };

  /**
   * Press `Done` button handler:
   * Save `completed` challenge to local cache
   * @returns
   */
  const challengeSavedHandler = () => {
    // if (!currentChallenge) return;
    const completions = completionsRef.current;
    if (!completions.includes(Number(id))) {
      // console.warn(`## current challenge not completed!`);
      addWarningToast(MISSION_INCOMPLETED);
      // play warning!
      notCompletedSound.play();
      return;
    }
    addSuccessToast(MISSION_MARK_COMPLETED);
    saveChallengeCompletion(Number(id));
    // play music!
    missionSavedSound.play();
  };

  // load subtitle content
  useEffect(() => {
    const mdRenderer = MarkdownIt();
    const { videoSubtitle } = selectedChallenge;
    const mdURL = sourceRepo + videoSubtitle;
    const fetchSubTitle = async () => {
      const mdResp = await fetch(mdURL);
      const mdFileContent = await mdResp.text();
      const htmlFromMD = mdRenderer.render(mdFileContent);
      setSubtitle(htmlFromMD);
    };
    fetchSubTitle();
  }, [selectedChallenge]);

  useEffect(() => {
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
    challengeWarningHandler,
    goBackChallengeHome,
    challengeSavedHandler,
    toggleSubTitle,
    toasterCallback,
    selectedChallenge,
    showSubTitle,
    globalFunctions,
    subtitle,
    toastState,
  };
};
