/**
 * A lightweight Leitner-style spaced-repetition scheduler for vocabulary.
 *
 * Each word climbs a ladder of boxes; the higher the box, the longer until it
 * is due for review again. Getting a word right on review promotes it (longer
 * interval); getting it wrong sends it back to box 1 and makes it due right
 * away. The intervals grow the way the user described: learn -> ~2 days ->
 * ~5 -> ~10 -> ~21 -> ~45 -> "retired".
 */

export interface SrsRecord {
  /** 1..MAX_BOX. Box MAX_BOX means retired (effectively never due again). */
  box: number;
  /** Milliseconds since epoch when this word next becomes due for review. */
  dueAt: number;
  lastReviewedAt: number;
  /** How many times the word has been missed on review. */
  lapses: number;
  /** Whether the most recent review was wrong (drives the "red" state). */
  lastWrong: boolean;
}

/** Colour-coded study state, mirroring the practice picker's palette. */
export type VocabState = "new" | "known" | "due" | "lapsed";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Days until a word in box N becomes due again. Index 0 is unused (a word is
 * only ever placed in box 1+). The last box is "retired". */
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
  if (!record) return "new";
  if (record.dueAt > now) return "known";
  return record.lastWrong ? "lapsed" : "due";
}

/** Whether the word should appear in a review queue right now. */
export function isDue(record: SrsRecord | undefined, now: number = Date.now()): boolean {
  const state = deriveState(record, now);
  return state === "due" || state === "lapsed";
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

  if (correct) {
    const nextBox = Math.min(MAX_BOX, box + 1);
    return {
      box: nextBox,
      dueAt: nextDue(nextBox, now),
      lastReviewedAt: now,
      lapses,
      lastWrong: false,
    };
  }

  return {
    box: 1,
    dueAt: now, // due again immediately; resurfaces next review session
    lastReviewedAt: now,
    lapses: lapses + 1,
    lastWrong: true,
  };
}

export const VOCAB_STATE_LABELS: Record<VocabState, string> = {
  new: "New",
  known: "Known",
  due: "Review due",
  lapsed: "Needs review",
};
