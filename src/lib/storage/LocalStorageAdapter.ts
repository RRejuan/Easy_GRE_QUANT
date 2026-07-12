import type {
  AttemptRecord,
  MockTestResult,
  SkillMasteryState,
  StorageAdapter,
} from "./StorageAdapter";
import { getActiveProfileId } from "./profiles";

const MAX_MOCK_HISTORY = 50;

function storageKey(): string {
  return `gre-quant:mastery:${getActiveProfileId()}`;
}

function mockHistoryKey(): string {
  return `gre-quant:mock-history:${getActiveProfileId()}`;
}

function loadMockHistory(): MockTestResult[] {
  const raw = localStorage.getItem(mockHistoryKey());
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MockTestResult[];
  } catch {
    return [];
  }
}

function loadAll(): Record<string, SkillMasteryState> {
  const raw = localStorage.getItem(storageKey());
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, SkillMasteryState>;
  } catch {
    return {};
  }
}

function saveAll(state: Record<string, SkillMasteryState>): void {
  localStorage.setItem(storageKey(), JSON.stringify(state));
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
      // Only correct attempts count toward the pace metric -- answering
      // wrong quickly isn't "fast", it's just wrong, and shouldn't prop up
      // the mastery score's speed component.
      totalTimeSec: existing.totalTimeSec + (attempt.correct ? attempt.timeSec : 0),
      totalTimeTargetSec:
        existing.totalTimeTargetSec + (attempt.correct ? attempt.timeTargetSec : 0),
      highestDifficultyCleared: attempt.correct
        ? Math.max(existing.highestDifficultyCleared, attempt.difficulty)
        : existing.highestDifficultyCleared,
    };

    all[attempt.skillId] = updated;
    saveAll(all);
    return updated;
  }

  recordMockTestResult(result: MockTestResult): void {
    const history = loadMockHistory();
    history.push(result);
    while (history.length > MAX_MOCK_HISTORY) history.shift();
    localStorage.setItem(mockHistoryKey(), JSON.stringify(history));
  }

  getMockTestHistory(): MockTestResult[] {
    return loadMockHistory();
  }
}

export function exportProgressJSON(): string {
  return localStorage.getItem(storageKey()) ?? "{}";
}

export function importProgressJSON(json: string): void {
  JSON.parse(json); // throws if invalid, before we touch storage
  localStorage.setItem(storageKey(), json);
}

/** Clears all mastery/attempt data and mock test history for the active profile only. */
export function resetProgress(): void {
  localStorage.removeItem(storageKey());
  localStorage.removeItem(mockHistoryKey());
}
