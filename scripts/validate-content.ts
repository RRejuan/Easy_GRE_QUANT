import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const rootDir = path.resolve(import.meta.dirname, "..");
const schemaDir = path.join(rootDir, "schema");
const dataDir = path.join(rootDir, "data");

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

function loadSchema(name: string) {
  return JSON.parse(readFileSync(path.join(schemaDir, name), "utf8"));
}

const validateSkill = ajv.compile(loadSchema("skill.schema.json"));
const validateQuestion = ajv.compile(loadSchema("question.schema.json"));
const validateDISet = ajv.compile(loadSchema("di-set.schema.json"));
const validateLesson = ajv.compile(loadSchema("lesson.schema.json"));

const errors: string[] = [];

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

// --- Skills ---
const skillsPath = path.join(dataDir, "skills.json");
const skills = readJson(skillsPath) as Array<Record<string, unknown>>;
const skillIds = new Set<string>();

for (const skill of skills) {
  if (!validateSkill(skill)) {
    errors.push(
      `skills.json > ${skill.id ?? "<unknown>"}: ${ajv.errorsText(validateSkill.errors)}`,
    );
    continue;
  }
  const id = skill.id as string;
  if (skillIds.has(id)) {
    errors.push(`skills.json > duplicate skill id "${id}"`);
  }
  skillIds.add(id);
}

for (const skill of skills) {
  const id = skill.id as string;
  const prerequisites = (skill.prerequisites as string[] | undefined) ?? [];
  for (const prereq of prerequisites) {
    if (prereq === id) {
      errors.push(`skill "${id}": lists itself as a prerequisite`);
    } else if (!skillIds.has(prereq)) {
      errors.push(`skill "${id}": unknown prerequisite "${prereq}"`);
    }
  }
}

// --- DI sets ---
const diSetIds = new Set<string>();
const diSetsPath = path.join(dataDir, "di-sets.json");
try {
  const diSets = readJson(diSetsPath) as Array<Record<string, unknown>>;
  for (const diSet of diSets) {
    if (!validateDISet(diSet)) {
      errors.push(
        `di-sets.json > ${diSet.id ?? "<unknown>"}: ${ajv.errorsText(validateDISet.errors)}`,
      );
      continue;
    }
    const id = diSet.id as string;
    if (diSetIds.has(id)) {
      errors.push(`di-sets.json > duplicate DI set id "${id}"`);
    }
    diSetIds.add(id);
  }
} catch (err) {
  if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
}

// --- Lessons ---
const lessonsDir = path.join(dataDir, "lessons");
const lessonSkillIds = new Set<string>();
try {
  for (const fileName of readdirSync(lessonsDir)) {
    if (!fileName.endsWith(".json")) continue;
    const skillIdFromFileName = fileName.replace(/\.json$/, "");
    const lesson = readJson(path.join(lessonsDir, fileName)) as Record<string, unknown>;

    if (!validateLesson(lesson)) {
      errors.push(
        `lessons/${fileName}: ${ajv.errorsText(validateLesson.errors)}`,
      );
      continue;
    }

    const skillId = lesson.skillId as string;
    if (skillId !== skillIdFromFileName) {
      errors.push(
        `lessons/${fileName}: skillId "${skillId}" does not match file name`,
      );
    }
    if (!skillIds.has(skillId)) {
      errors.push(`lessons/${fileName}: unknown skillId "${skillId}"`);
    }
    if (lessonSkillIds.has(skillId)) {
      errors.push(`lessons/${fileName}: duplicate lesson for skill "${skillId}"`);
    }
    lessonSkillIds.add(skillId);
  }
} catch (err) {
  if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
}

// --- Questions ---
const questionsDir = path.join(dataDir, "questions");
const questionIds = new Set<string>();

for (const fileName of readdirSync(questionsDir)) {
  if (!fileName.endsWith(".json")) continue;
  const skillIdFromFileName = fileName.replace(/\.json$/, "");
  const filePath = path.join(questionsDir, fileName);
  const questions = readJson(filePath) as Array<Record<string, unknown>>;

  if (!skillIds.has(skillIdFromFileName)) {
    errors.push(
      `questions/${fileName}: file name does not match any skill id in skills.json`,
    );
  }

  for (const question of questions) {
    const qid = (question.id as string) ?? "<unknown>";
    if (!validateQuestion(question)) {
      errors.push(
        `questions/${fileName} > ${qid}: ${ajv.errorsText(validateQuestion.errors)}`,
      );
      continue;
    }

    if (questionIds.has(qid)) {
      errors.push(`questions/${fileName} > duplicate question id "${qid}"`);
    }
    questionIds.add(qid);

    const primarySkill = question.primarySkill as string;
    if (primarySkill !== skillIdFromFileName) {
      errors.push(
        `questions/${fileName} > ${qid}: primarySkill "${primarySkill}" does not match file's skill "${skillIdFromFileName}"`,
      );
    }
    if (!skillIds.has(primarySkill)) {
      errors.push(
        `questions/${fileName} > ${qid}: unknown primarySkill "${primarySkill}"`,
      );
    }

    for (const secondary of (question.secondarySkills as string[]) ?? []) {
      if (!skillIds.has(secondary)) {
        errors.push(
          `questions/${fileName} > ${qid}: unknown secondarySkill "${secondary}"`,
        );
      }
    }

    const diSetId = question.diSetId as string | undefined;
    if (diSetId && !diSetIds.has(diSetId)) {
      errors.push(
        `questions/${fileName} > ${qid}: unknown diSetId "${diSetId}"`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} error(s):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `Content validation passed: ${skillIds.size} skill(s), ${lessonSkillIds.size} lesson(s), ${questionIds.size} question(s), ${diSetIds.size} DI set(s).`,
);
