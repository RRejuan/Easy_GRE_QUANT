export type Area = "Arithmetic" | "Algebra" | "Geometry" | "Data Analysis";

export interface Skill {
  id: string;
  area: Area;
  topic: string;
  name: string;
  prerequisites: string[];
  description: string;
}
