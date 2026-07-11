export interface Formula {
  name: string;
  expression: string;
  notes?: string;
}

export interface Lesson {
  skillId: string;
  summary: string;
  formulas: Formula[];
  explanation: string;
}
