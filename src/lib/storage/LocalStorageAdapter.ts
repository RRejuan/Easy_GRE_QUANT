import type {
  AttemptRecord,
  SkillMasteryState,
  StorageAdapter,
} from "./StorageAdapter";

const STORAGE_KEY = "gre-quant:mastery";

function loadAll(): Record<string, SkillMasteryState> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, SkillMasteryState>;
  } catch {
    return {};
  }
}

function saveAll(state: Record<string, SkillMasteryState>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export class LocalStorageAdapter implements StorageAdapter {
  getSkillMastery(skillId: string): SkillMasteryState | undefined {
    return loadAll()[skillId];
  }

  getAllMastery(): SkillMasteryState[] {
    return Object.values(loadAll());
  }

  recordAttempt(attempt: AttemptRecord): SkillMasteryState {
    const all = loadAll();
    const existing = all[attempt.skillId] ?? {
      skillId: attempt.skillId,
      attempts: 0,
      correctCount: 0,
      totalTimeSec: 0,
      totalTimeTargetSec: 0,
      highestDifficultyCleared: 0,
    };

    const updated: SkillMasteryState = {
      skillId: attempt.skillId,
      attempts: existing.attempts + 1,
      correctCount: existing.correctCount + (attempt.correct ? 1 : 0),
      totalTimeSec: existing.totalTimeSec + attempt.timeSec,
      totalTimeTargetSec: existing.totalTimeTargetSec + attempt.timeTargetSec,
      highestDifficultyCleared: attempt.correct
        ? Math.max(existing.highestDifficultyCleared, attempt.difficulty)
        : existing.highestDifficultyCleared,
    };

    all[attempt.skillId] = updated;
    saveAll(all);
    return updated;
  }
}
