import type {
  AttemptRecord,
  MockTestResult,
  SkillMasteryState,
  StorageAdapter,
} from "./StorageAdapter";
import { getStorageNamespace } from "./namespace";

export const MAX_MOCK_HISTORY = 50;

/** When signed in, cloud sync registers a listener here so every local write
 * is mirrored to Firestore. Null (guest mode) means writes stay local-only. */
export interface CloudWriteListener {
  onMasteryChanged(all: Record<string, SkillMasteryState>): void;
  onMockTestRecorded(result: MockTestResult): void;
  onProgressReset(): void;
}

let cloudListener: CloudWriteListener | null = null;

export function setCloudWriteListener(listener: CloudWriteListener | null): void {
  cloudListener = listener;
}

function storageKey(namespace: string): string {
  return `gre-quant:mastery:${namespace}`;
}

function mockHistoryKey(namespace: string): string {
  return `gre-quant:mock-history:${namespace}`;
}

export function loadMasteryForNamespace(
  namespace: string,
): Record<string, SkillMasteryState> {
  const raw = localStorage.getItem(storageKey(namespace));
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, SkillMasteryState>;
  } catch {
    return {};
  }
}

export function loadMockHistoryForNamespace(namespace: string): MockTestResult[] {
  const raw = localStorage.getItem(mockHistoryKey(namespace));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MockTestResult[];
  } catch {
    return [];
  }
}

function loadMockHistory(): MockTestResult[] {
  return loadMockHistoryForNamespace(getStorageNamespace());
}

function loadAll(): Record<string, SkillMasteryState> {
  return loadMasteryForNamespace(getStorageNamespace());
}

export function saveAllMastery(state: Record<string, SkillMasteryState>): void {
  localStorage.setItem(storageKey(getStorageNamespace()), JSON.stringify(state));
}

export function saveMockHistory(history: MockTestResult[]): void {
  localStorage.setItem(
    mockHistoryKey(getStorageNamespace()),
    JSON.stringify(history),
  );
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
    saveAllMastery(all);
    cloudListener?.onMasteryChanged(all);
    return updated;
  }

  recordMockTestResult(result: MockTestResult): void {
    const history = loadMockHistory();
    history.push(result);
    while (history.length > MAX_MOCK_HISTORY) history.shift();
    saveMockHistory(history);
    cloudListener?.onMockTestRecorded(result);
  }

  getMockTestHistory(): MockTestResult[] {
    return loadMockHistory();
  }
}

export function exportProgressJSON(): string {
  return localStorage.getItem(storageKey(getStorageNamespace())) ?? "{}";
}

export function importProgressJSON(json: string): void {
  JSON.parse(json); // throws if invalid, before we touch storage
  localStorage.setItem(storageKey(getStorageNamespace()), json);
}

/** Clears all mastery/attempt data and mock test history for the active
 * profile (or the signed-in account, including its cloud copy). */
export function resetProgress(): void {
  localStorage.removeItem(storageKey(getStorageNamespace()));
  localStorage.removeItem(mockHistoryKey(getStorageNamespace()));
  cloudListener?.onProgressReset();
}
