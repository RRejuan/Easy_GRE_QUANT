import { getQuestionsForSkill } from "./content";
import { storageAdapter } from "./storage";

/**
 * Mastery is simply the share of a skill's question pool answered correctly on
 * the most recent attempt. Every distinct question is worth an equal
 * 1/(pool size): one correct answer in a 20-question skill is 5%, and turning
 * the whole pool green (the same green as the practice question picker) is
 * 100%. A question later answered wrong drops back out of the count.
 */
export function computeMastery(
  correctQuestions: number,
  totalQuestions: number,
): number {
  if (totalQuestions <= 0) return 0;
  const ratio = correctQuestions / totalQuestions;
  return Math.round(Math.min(1, ratio) * 100);
}

/** Mastery percent for a skill: the number of its questions whose latest
 * attempt was correct, over the size of its current pool. */
export function skillMasteryPercent(skillId: string): number {
  const statuses = storageAdapter.getQuestionStatuses(skillId);
  const questions = getQuestionsForSkill(skillId);
  const correct = questions.reduce(
    (count, q) => count + (statuses[q.id] === true ? 1 : 0),
    0,
  );
  return computeMastery(correct, questions.length);
}
