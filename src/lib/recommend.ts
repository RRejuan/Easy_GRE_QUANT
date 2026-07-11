import type { Skill } from "../types";
import { getQuestionsForSkill, skillsWithContent } from "./content";
import { storageAdapter } from "./storage";
import { computeMastery } from "./mastery";

const MASTERY_THRESHOLD = 60;

function masteryFor(skillId: string): number {
  const state = storageAdapter.getSkillMastery(skillId);
  return state ? computeMastery(state) : 0;
}

/** A prerequisite only gates progress if it has question content; skills whose prerequisites aren't built yet are never permanently locked out. */
function isUnlocked(skill: Skill): boolean {
  return skill.prerequisites.every((prereqId) => {
    const hasContent = getQuestionsForSkill(prereqId).length > 0;
    if (!hasContent) return true;
    return masteryFor(prereqId) >= MASTERY_THRESHOLD;
  });
}

export function recommendNextSkill(): Skill | undefined {
  const candidates = skillsWithContent().filter(isUnlocked);
  const pool = candidates.length > 0 ? candidates : skillsWithContent();

  return [...pool].sort((a, b) => masteryFor(a.id) - masteryFor(b.id))[0];
}
