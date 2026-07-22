/**
 * A lightweight Leitner-style spaced-repetition scheduler for vocabulary.
 *
 * A word first goes through a short LEARNING phase: it only turns "known"
 * (green) after being answered correctly GRADUATION_CORRECT times; a wrong
 * answer resets that progress. Once it graduates it climbs a ladder of review
 * boxes, and the higher the box the longer until it is due again:
 * learn -> ~2 days -> ~5 -> ~10 -> ~21 -> ~45 -> retired. Missing a review
 * drops it back to the shortest interval and marks it "needs review" (red).
 */

export interface SrsRecord {
  /** 0 = still learning (not yet green). 1..MAX_BOX = graduated review boxes;
   * MAX_BOX means retired (effectively never due again). */
  box: number;
  /** Milliseconds since epoch when this word next becomes due for review. */
  dueAt: number;
  lastReviewedAt: number;
  /** How many times a graduated word has later been missed on review. */
  lapses: number;
  /** Whether the most recent answer was wrong (drives the "red" state). */
  lastWrong: boolean;
  /** Correct answers accumulated toward graduation while still learning. */
  learningCorrect: number;
}

/** Colour-coded study state, mirroring the practice picker's palette. */
export type VocabState = "new" | "known" | "due" | "lapsed";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Correct answers needed before a new word is considered learned (green). */
export const GRADUATION_CORRECT = 2;

/** Days until a graduated word in box N becomes due again. Index 0 is unused. */
const INTERVAL_DAYS = [0, 2, 5, 10, 21, 45];
export const MAX_BOX = INTERVAL_DAYS.length; // 6 -> retired

function nextDue(box: number, now: number): number {
  if (box >= MAX_BOX) return Number.MAX_SAFE_INTEGER; // retired: never due
  return now + INTERVAL_DAYS[box] * DAY_MS;
}

export function deriveState(
  record: SrsRecord | undefined,
  now: number = Date.now(),
): VocabState {
  if (!record || record.box === 0) return "new"; // never learned, or still learning
  if (record.dueAt > now) return "known";
  return record.lastWrong ? "lapsed" : "due";
}

/** Whether a graduated word should appear in a review queue right now.
 * Learning-phase words are drilled inside their lesson, not here. */
export function isDue(record: SrsRecord | undefined, now: number = Date.now()): boolean {
  const state = deriveState(record, now);
  return state === "due" || state === "lapsed";
}

/** True once the word has graduated out of the learning phase (is green or due
 * for review rather than brand new). Used to end a learning drill. */
export function isGraduated(record: SrsRecord | undefined): boolean {
  return (record?.box ?? 0) >= 1;
}

/** Applies a review result, returning the next record. A missing record means
 * the word is being learned for the first time. */
export function reviewWord(
  record: SrsRecord | undefined,
  correct: boolean,
  now: number = Date.now(),
): SrsRecord {
  const box = record?.box ?? 0;
  const lapses = record?.lapses ?? 0;
  const learningCorrect = record?.learningCorrect ?? 0;

  // Learning phase: need GRADUATION_CORRECT correct answers to turn green.
  if (box === 0) {
    if (!correct) {
      return {
        box: 0,
        dueAt: now,
        lastReviewedAt: now,
        lapses,
        lastWrong: true,
        learningCorrect: 0,
      };
    }
    const nextCorrect = learningCorrect + 1;
    if (nextCorrect >= GRADUATION_CORRECT) {
      return {
        box: 1,
        dueAt: nextDue(1, now),
        lastReviewedAt: now,
        lapses,
        lastWrong: false,
        learningCorrect: nextCorrect,
      };
    }
    return {
      box: 0,
      dueAt: now,
      lastReviewedAt: now,
      lapses,
      lastWrong: false,
      learningCorrect: nextCorrect,
    };
  }

  // Graduated review phase.
  if (correct) {
    const nextBox = Math.min(MAX_BOX, box + 1);
    return {
      box: nextBox,
      dueAt: nextDue(nextBox, now),
      lastReviewedAt: now,
      lapses,
      lastWrong: false,
      learningCorrect,
    };
  }
  return {
    box: 1,
    dueAt: now, // due again immediately; resurfaces next review session
    lastReviewedAt: now,
    lapses: lapses + 1,
    lastWrong: true,
    learningCorrect,
  };
}

export const VOCAB_STATE_LABELS: Record<VocabState, string> = {
  new: "New",
  known: "Known",
  due: "Review due",
  lapsed: "Needs review",
};
