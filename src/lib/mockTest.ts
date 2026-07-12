import type { Question } from "../types";
import { allQuestions } from "./content";

export type Tier = "easy" | "medium" | "hard";

export const SECTION1_QUESTION_COUNT = 12;
export const SECTION1_TIME_SEC = 21 * 60;
export const SECTION2_QUESTION_COUNT = 15;
export const SECTION2_TIME_SEC = 26 * 60;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Section 1 and the tiered section 2 pools are assembled dynamically from
 * the full question pool (every skill plus the four GRE-mock-style mixed
 * practice pools), rather than from a fixed, hand-curated mock — this
 * mirrors the real test, where a single section mixes topics freely.
 */
export function assembleSection1(): Question[] {
  return shuffle(allQuestions()).slice(0, SECTION1_QUESTION_COUNT);
}

export function determineTier(correctCount: number, total: number): Tier {
  const ratio = total === 0 ? 0 : correctCount / total;
  if (ratio >= 0.8) return "hard";
  if (ratio >= 0.5) return "medium";
  return "easy";
}

const TIER_DIFFICULTY_RANGE: Record<Tier, [number, number]> = {
  easy: [1, 2],
  medium: [2, 3],
  hard: [3, 5],
};

export function assembleSection2(tier: Tier, excludeIds: Set<string>): Question[] {
  const [min, max] = TIER_DIFFICULTY_RANGE[tier];
  const eligible = allQuestions().filter(
    (q) => q.difficulty >= min && q.difficulty <= max && !excludeIds.has(q.id),
  );
  return shuffle(eligible).slice(0, SECTION2_QUESTION_COUNT);
}

/**
 * A rough, non-official score estimate (130-170) based on section 2
 * difficulty tier and total raw score across both sections. This is a
 * linear approximation, not ETS's official concordance table.
 */
export function estimateScore(
  totalCorrect: number,
  totalQuestions: number,
  section2Tier: Tier,
): number {
  const ratio = totalQuestions === 0 ? 0 : totalCorrect / totalQuestions;
  const tierBonus = { easy: -3, medium: 0, hard: 3 }[section2Tier];
  const raw = 130 + ratio * 40 + tierBonus;
  return Math.max(130, Math.min(170, Math.round(raw)));
}
