import type { Skill, Question, Lesson, Section } from "../types";
import skillsData from "../../data/skills.json";

const questionModules = import.meta.glob<{ default: Question[] }>(
  "../../data/questions/*.json",
  { eager: true },
);
const lessonModules = import.meta.glob<{ default: Lesson }>(
  "../../data/lessons/*.json",
  { eager: true },
);

function skillIdFromPath(path: string): string {
  return path.split("/").pop()!.replace(/\.json$/, "");
}

export const skills: Skill[] = skillsData as Skill[];

const questionsBySkill = new Map<string, Question[]>();
for (const [path, mod] of Object.entries(questionModules)) {
  questionsBySkill.set(skillIdFromPath(path), mod.default);
}

const lessonsBySkill = new Map<string, Lesson>();
for (const [path, mod] of Object.entries(lessonModules)) {
  lessonsBySkill.set(skillIdFromPath(path), mod.default);
}

const questionsById = new Map<string, Question>();
for (const questionList of questionsBySkill.values()) {
  for (const question of questionList) {
    questionsById.set(question.id, question);
  }
}

export function getQuestionById(questionId: string): Question | undefined {
  return questionsById.get(questionId);
}

export function getSkill(skillId: string): Skill | undefined {
  return skills.find((skill) => skill.id === skillId);
}

export function getQuestionsForSkill(skillId: string): Question[] {
  return questionsBySkill.get(skillId) ?? [];
}

export function allQuestions(): Question[] {
  return [...questionsBySkill.values()].flat();
}

export function getLessonForSkill(skillId: string): Lesson | undefined {
  return lessonsBySkill.get(skillId);
}

export function skillsWithContent(): Skill[] {
  return skills.filter((skill) => questionsBySkill.has(skill.id));
}

/** A skill's section, treating the absent field on legacy skills as "Quant". */
export function sectionOfSkill(skillId: string): Section {
  return getSkill(skillId)?.section ?? "Quant";
}

export function skillsWithContentInSection(section: Section): Skill[] {
  return skillsWithContent().filter(
    (skill) => (skill.section ?? "Quant") === section,
  );
}

/** Questions belonging to Quant skills only — used by the (Quant) mock test and
 * diagnostic so verbal questions never leak into them. */
export function quantQuestions(): Question[] {
  return allQuestions().filter(
    (question) => sectionOfSkill(question.primarySkill) === "Quant",
  );
}

export interface SkillGroup {
  area: string;
  topics: { topic: string; skills: Skill[] }[];
}

export function groupSkillsByAreaAndTopic(skillList: Skill[]): SkillGroup[] {
  const areaOrder: string[] = [];
  const byArea = new Map<string, Map<string, Skill[]>>();

  for (const skill of skillList) {
    if (!byArea.has(skill.area)) {
      byArea.set(skill.area, new Map());
      areaOrder.push(skill.area);
    }
    const byTopic = byArea.get(skill.area)!;
    if (!byTopic.has(skill.topic)) byTopic.set(skill.topic, []);
    byTopic.get(skill.topic)!.push(skill);
  }

  return areaOrder.map((area) => ({
    area,
    topics: [...byArea.get(area)!.entries()].map(([topic, topicSkills]) => ({
      topic,
      skills: topicSkills,
    })),
  }));
}
