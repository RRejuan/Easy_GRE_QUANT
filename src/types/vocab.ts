export type VocabTier = "easy" | "medium" | "hard";

export interface VocabWord {
  /** Unique slug across all lessons; the SRS review state is keyed by it. */
  id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  tier: VocabTier;
  synonyms?: string[];
}

export interface VocabLesson {
  id: string;
  title: string;
  words: VocabWord[];
  /** A short story/essay that uses every word in the lesson. Each target word
   * is wrapped in a [[wordId|shown text]] token (the shown text may be an
   * inflected form) so the UI can highlight it and reveal its definition. */
  story: string;
}
