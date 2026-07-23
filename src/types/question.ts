import type { Figure } from "./figure";
import type { Chart } from "./chart";

export type ShortcutTag = "backsolve" | "plug-in" | "estimate" | "eliminate";

export interface QuestionOption {
  id: string;
  text: string;
}

/** A randomized integer parameter, re-rolled each time the question loads. Referenced in text as {{name}}. */
export interface VariableSpec {
  name: string;
  min: number;
  max: number;
  step?: number;
}

interface QuestionBase {
  id: string;
  primarySkill: string;
  secondarySkills: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  stem: string;
  /** An optional reading passage shown above the stem (Reading Comprehension).
   * Blank-line-separated paragraphs render as separate paragraphs. */
  passage?: string;
  solutionStandard: string;
  solutionShortcut?: string;
  shortcutTags?: ShortcutTag[];
  timeTargetSec: number;
  /** Set when this question belongs to a shared-figure Data Interpretation set. */
  diSetId?: string;
  /** When present, {{name}} placeholders in text fields are replaced with a random value on each load. */
  variables?: VariableSpec[];
  /** An optional geometric diagram shown alongside the stem. */
  figure?: Figure;
  /** An optional data chart (bar/pie/line) shown alongside the stem, for Data Interpretation questions. */
  chart?: Chart;
}

export interface QCQuestion extends QuestionBase {
  type: "QC";
  quantityA: string;
  quantityB: string;
  answer: "A" | "B" | "C" | "D";
}

export interface MCQuestion extends QuestionBase {
  type: "MC";
  options: QuestionOption[];
  answer: string;
}

export interface MultiMCQuestion extends QuestionBase {
  type: "MultiMC";
  options: QuestionOption[];
  answer: string[];
}

export interface NumericQuestion extends QuestionBase {
  type: "Numeric";
  answer: number;
  acceptableRange?: [number, number];
  /** JS-expression string over the variables' names; overrides `answer` when `variables` is set. */
  answerFormula?: string;
}

export type Question = QCQuestion | MCQuestion | MultiMCQuestion | NumericQuestion;
