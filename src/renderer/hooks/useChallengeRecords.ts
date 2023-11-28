/**
 * Get challenges and check history to display recent completed in home page
 *
 * @date 2023/11/28
 */
import { useState, useEffect } from 'react';

import { sourceRepo, Challenge } from '../config';
import { getCompletedChallenges } from '../state/storage';

export const useChallengeRecords = () => {
  // save `touched` challenges
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // fetching remote challenges data
  useEffect(() => {
    const completions = getCompletedChallenges();
    const challengeTouchedEnhancer = (clg: Challenge) => {
      const existing = completions.find((c) => c.id === clg.id);
      return { ...clg, touched: !!existing };
    };
    const touchedFilter = (clg: Challenge) => !!clg.touched;

    const fetchChallenges = async () => {
      const response = await fetch(`${sourceRepo}data/challenges.json`);
      const results = (await response.json()) as Challenge[];
      const completedChallenges = results
        .map(challengeTouchedEnhancer)
        .filter(touchedFilter)
        .reverse();
      setChallenges(completedChallenges);
    };
    // load challenges ....
    fetchChallenges();
  }, []);

  return {
    challenges,
  };
};
