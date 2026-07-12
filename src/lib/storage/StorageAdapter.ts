export interface AttemptRecord {
  questionId: string;
  skillId: string;
  correct: boolean;
  timeSec: number;
  timeTargetSec: number;
  difficulty: number;
}

export interface SkillMasteryState {
  skillId: string;
  attempts: number;
  correctCount: number;
  totalTimeSec: number;
  totalTimeTargetSec: number;
  highestDifficultyCleared: number;
}

/** One question as it was actually presented in a mock test attempt, including the resolved {{variable}} values so it can be re-rendered identically during later review. */
export interface MockTestQuestionAttempt {
  questionId: string;
  values: Record<string, number>;
  answer: unknown;
  correct: boolean;
  timeSec: number;
}

export interface MockTestSectionResult {
  questions: MockTestQuestionAttempt[];
  tier?: string;
}

export interface MockTestResult {
  id: string;
  date: string;
  section1: MockTestSectionResult;
  section2: MockTestSectionResult;
  estimatedScore: number;
}

export interface StorageAdapter {
  getSkillMastery(skillId: string): SkillMasteryState | undefined;
  getAllMastery(): SkillMasteryState[];
  recordAttempt(attempt: AttemptRecord): SkillMasteryState;
  recordMockTestResult(result: MockTestResult): void;
  getMockTestHistory(): MockTestResult[];
}
