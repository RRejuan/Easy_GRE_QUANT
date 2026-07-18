import type { SkillMasteryState } from "./storage/StorageAdapter";

const MAX_DIFFICULTY = 5;

/** Attempts needed before the score is fully trusted. Below this, mastery is
 * scaled down proportionally: one lucky correct answer is weak evidence and
 * shouldn't read as near-mastery of a skill. */
const FULL_CONFIDENCE_ATTEMPTS = 10;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Combines accuracy, speed relative to target time, and highest difficulty cleared into a single 0-100 mastery score. */
export function computeMastery(state: SkillMasteryState): number {
  if (state.attempts === 0) return 0;

  const accuracyScore = (state.correctCount / state.attempts) * 100;

  // totalTimeTargetSec only accumulates on correct attempts (see
  // recordAttempt), so it's 0 whenever nothing has been solved correctly
  // yet -- guard the division rather than let a 0/0 NaN leak into the score.
  const timeRatio = state.totalTimeTargetSec > 0 ? state.totalTimeSec / state.totalTimeTargetSec : 1;
  const speedScore = state.totalTimeTargetSec > 0 ? clamp((2 - timeRatio) * 100, 0, 100) : 0;

  const difficultyScore = (state.highestDifficultyCleared / MAX_DIFFICULTY) * 100;

  const composite =
    accuracyScore * 0.5 + speedScore * 0.3 + difficultyScore * 0.2;
  const confidence = Math.min(1, state.attempts / FULL_CONFIDENCE_ATTEMPTS);
  return Math.round(composite * confidence);
}
