export type Area =
  | "Arithmetic"
  | "Algebra"
  | "Geometry"
  | "Data Analysis"
  | "Text Completion"
  | "Sentence Equivalence"
  | "Reading Comprehension";

export type Section = "Quant" | "Verbal";

export interface Skill {
  id: string;
  area: Area;
  topic: string;
  name: string;
  prerequisites: string[];
  description: string;
  /** Which half of the GRE this skill belongs to. Absent means "Quant"
   * (every existing skill predates the verbal section). */
  section?: Section;
}
