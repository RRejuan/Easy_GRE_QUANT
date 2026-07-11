export type ShortcutTag = "backsolve" | "plug-in" | "estimate" | "eliminate";

export interface QuestionOption {
  id: string;
  text: string;
}

interface QuestionBase {
  id: string;
  primarySkill: string;
  secondarySkills: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  stem: string;
  solutionStandard: string;
  solutionShortcut?: string;
  shortcutTags?: ShortcutTag[];
  timeTargetSec: number;
  /** Set when this question belongs to a shared-figure Data Interpretation set. */
  diSetId?: string;
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
}

export type Question = QCQuestion | MCQuestion | MultiMCQuestion | NumericQuestion;
