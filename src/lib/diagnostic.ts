import type { Question } from "../types";
import { getQuestionsForSkill, skillsWithContent } from "./content";

/** Spreads across every skill with content first (one question each, medium difficulty), then adds more per skill in later rounds until the target count is hit or content is exhausted. */
export function buildDiagnostic(targetCount = 24): Question[] {
  const queues = skillsWithContent().map((skill) => [
    ...getQuestionsForSkill(skill.id),
  ]);

  const picked: Question[] = [];
  let round = 0;
  while (picked.length < targetCount) {
    let addedThisRound = false;
    for (const queue of queues) {
      if (picked.length >= targetCount) break;
      if (queue.length === 0) continue;
      const index = round === 0 ? Math.floor(queue.length / 2) : 0;
      const [question] = queue.splice(index, 1);
      picked.push(question);
      addedThisRound = true;
    }
    round += 1;
    if (!addedThisRound) break;
  }

  return picked;
}
