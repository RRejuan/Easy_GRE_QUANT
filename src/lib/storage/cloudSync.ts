import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import type { MockTestResult, SkillMasteryState } from "./StorageAdapter";
import {
  MAX_MOCK_HISTORY,
  loadMasteryForNamespace,
  loadMockHistoryForNamespace,
  saveAllMastery,
  saveMockHistory,
  setCloudWriteListener,
} from "./LocalStorageAdapter";
import { getStorageNamespace, setCloudNamespace } from "./namespace";
import { getActiveProfileId } from "./profiles";

function masteryDoc(uid: string) {
  return doc(db!, "users", uid, "data", "mastery");
}

function mockTestsCollection(uid: string) {
  return collection(db!, "users", uid, "mockTests");
}

function warnSyncFailure(err: unknown): void {
  console.warn("Cloud sync write failed; progress is still saved locally.", err);
}

async function pushMastery(
  uid: string,
  all: Record<string, SkillMasteryState>,
): Promise<void> {
  await setDoc(masteryDoc(uid), { skills: all });
}

async function pushMockResult(uid: string, result: MockTestResult): Promise<void> {
  await setDoc(doc(mockTestsCollection(uid), result.id), result);
}

async function clearCloud(uid: string): Promise<void> {
  const snapshot = await getDocs(mockTestsCollection(uid));
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(masteryDoc(uid));
}

/** Called once per page load when a signed-in user is confirmed, before the
 * app renders. Points local storage at the account's namespace, reconciles
 * local cache with Firestore (per skill, more attempts wins; mock tests are
 * unioned by id), and registers the listener that mirrors every subsequent
 * write to Firestore.
 *
 * On a true first sign-in (cloud empty, account namespace empty) the active
 * guest profile's progress is adopted, so nothing done before creating the
 * account is lost. */
export async function beginCloudSession(uid: string): Promise<void> {
  if (!db) return;
  setCloudNamespace(`firebase:${uid}`);

  const [masterySnap, mockSnap] = await Promise.all([
    getDoc(masteryDoc(uid)),
    getDocs(mockTestsCollection(uid)),
  ]);
  const cloudMastery: Record<string, SkillMasteryState> = masterySnap.exists()
    ? ((masterySnap.data().skills ?? {}) as Record<string, SkillMasteryState>)
    : {};
  const cloudMocks = mockSnap.docs.map((d) => d.data() as MockTestResult);

  let localMastery = loadMasteryForNamespace(getStorageNamespace());
  let localMocks = loadMockHistoryForNamespace(getStorageNamespace());

  const cloudEmpty = !masterySnap.exists() && cloudMocks.length === 0;
  const accountLocalEmpty =
    Object.keys(localMastery).length === 0 && localMocks.length === 0;
  if (cloudEmpty && accountLocalEmpty) {
    const guestId = getActiveProfileId();
    localMastery = loadMasteryForNamespace(guestId);
    localMocks = loadMockHistoryForNamespace(guestId);
  }

  const mergedMastery: Record<string, SkillMasteryState> = { ...cloudMastery };
  for (const [skillId, local] of Object.entries(localMastery)) {
    const cloud = mergedMastery[skillId];
    if (!cloud || local.attempts > cloud.attempts) mergedMastery[skillId] = local;
  }

  const cloudMockIds = new Set(cloudMocks.map((m) => m.id));
  const mergedMocks = [
    ...cloudMocks,
    ...localMocks.filter((m) => !cloudMockIds.has(m.id)),
  ].sort((a, b) => a.date.localeCompare(b.date));
  while (mergedMocks.length > MAX_MOCK_HISTORY) mergedMocks.shift();

  saveAllMastery(mergedMastery);
  saveMockHistory(mergedMocks);

  const cloudMissingMastery =
    JSON.stringify(mergedMastery) !== JSON.stringify(cloudMastery);
  if (cloudMissingMastery && Object.keys(mergedMastery).length > 0) {
    await pushMastery(uid, mergedMastery).catch(warnSyncFailure);
  }
  const cloudMissingMocks = mergedMocks.filter((m) => !cloudMockIds.has(m.id));
  await Promise.all(
    cloudMissingMocks.map((m) => pushMockResult(uid, m).catch(warnSyncFailure)),
  );

  setCloudWriteListener({
    onMasteryChanged: (all) => void pushMastery(uid, all).catch(warnSyncFailure),
    onMockTestRecorded: (result) =>
      void pushMockResult(uid, result).catch(warnSyncFailure),
    onProgressReset: () => void clearCloud(uid).catch(warnSyncFailure),
  });
}

/** Reverts to guest mode: stops mirroring writes and re-keys local storage
 * back to the active guest profile. The account's local cache is left in
 * place so the next sign-in on this device starts warm. */
export function endCloudSession(): void {
  setCloudWriteListener(null);
  setCloudNamespace(null);
}
