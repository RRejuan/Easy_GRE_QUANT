import type { VocabLesson, VocabWord } from "../types";

const lessonModules = import.meta.glob<{ default: VocabLesson }>(
  "../../data/vocab/*.json",
  { eager: true },
);

const lessons: VocabLesson[] = Object.values(lessonModules)
  .map((mod) => mod.default)
  .sort((a, b) => a.id.localeCompare(b.id));

export interface VocabWordWithLesson extends VocabWord {
  lessonId: string;
}

const wordsById = new Map<string, VocabWordWithLesson>();
for (const lesson of lessons) {
  for (const word of lesson.words) {
    wordsById.set(word.id, { ...word, lessonId: lesson.id });
  }
}

export function listVocabLessons(): VocabLesson[] {
  return lessons;
}

export function getVocabLesson(id: string): VocabLesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getVocabWord(id: string): VocabWordWithLesson | undefined {
  return wordsById.get(id);
}

export function allVocabWords(): VocabWordWithLesson[] {
  return [...wordsById.values()];
}
