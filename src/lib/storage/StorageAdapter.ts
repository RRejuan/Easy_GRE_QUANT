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

export interface StorageAdapter {
  getSkillMastery(skillId: string): SkillMasteryState | undefined;
  getAllMastery(): SkillMasteryState[];
  recordAttempt(attempt: AttemptRecord): SkillMasteryState;
}
