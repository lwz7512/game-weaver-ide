/**
 * Get challenges and check history to display recent completed in home page
 *
 * @date 2023/11/28
 */
import { useState, useEffect } from 'react';

import { sourceRepo, Challenge } from '../config';
import { getCompletedChallenges } from '../state/storage';

export const useChallengeRecords = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // fetching remote challenges data
  useEffect(() => {
    const completions = getCompletedChallenges();
    const challengeCompletedEnhancer = (clg: Challenge) => {
      const existing = completions.find((c) => c.id === clg.id);
      return { ...clg, completed: !!existing };
    };
    const completedFilter = (clg: Challenge) => !!clg.completed;

    const fetchChallenges = async () => {
      const response = await fetch(`${sourceRepo}data/challenges.json`);
      const results = (await response.json()) as Challenge[];
      const completedChallenges = results
        .map(challengeCompletedEnhancer)
        .filter(completedFilter)
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
