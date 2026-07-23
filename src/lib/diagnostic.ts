import type { Question, Skill } from "../types";
import { getQuestionsForSkill, skillsWithContentInSection } from "./content";

const AREA_ORDER = ["Arithmetic", "Algebra", "Geometry", "Data Analysis"];

/**
 * Round-robin merge of skills by area (Arithmetic[0], Algebra[0], Geometry[0],
 * Data Analysis[0], Arithmetic[1], ...) so that taking the first N skills off
 * this list always yields a roughly even spread across all 4 areas, instead
 * of exhausting one area before ever reaching the next.
 */
function interleaveByArea(skills: Skill[]): Skill[] {
  const buckets = AREA_ORDER.map((area) => skills.filter((s) => s.area === area));
  const result: Skill[] = [];
  let i = 0;
  while (buckets.some((bucket) => i < bucket.length)) {
    for (const bucket of buckets) {
      if (i < bucket.length) result.push(bucket[i]);
    }
    i += 1;
  }
  return result;
}

/**
 * Spreads across every real skill (excluding the standalone mixed-practice
 * pools, which are for capstone review rather than initial diagnosis),
 * interleaved evenly across all 4 areas, one question each at first, then
 * more per skill in later rounds until the target count is hit or content
 * is exhausted.
 */
export function buildDiagnostic(targetCount = 40): Question[] {
  const skills = interleaveByArea(
    skillsWithContentInSection("Quant").filter(
      (skill) => skill.topic !== "Mixed Practice",
    ),
  );
  const queues = skills.map((skill) => [...getQuestionsForSkill(skill.id)]);

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
