import type { SkillMasteryState } from "./storage/StorageAdapter";

const MAX_DIFFICULTY = 5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Combines accuracy, speed relative to target time, and highest difficulty cleared into a single 0-100 mastery score. */
export function computeMastery(state: SkillMasteryState): number {
  if (state.attempts === 0) return 0;

  const accuracyScore = (state.correctCount / state.attempts) * 100;

  const timeRatio = state.totalTimeSec / state.totalTimeTargetSec;
  const speedScore = clamp((2 - timeRatio) * 100, 0, 100);

  const difficultyScore = (state.highestDifficultyCleared / MAX_DIFFICULTY) * 100;

  return Math.round(accuracyScore * 0.5 + speedScore * 0.3 + difficultyScore * 0.2);
}
