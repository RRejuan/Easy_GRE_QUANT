import type { SrsRecord } from "../srs";
import { getStorageNamespace } from "./namespace";

/** wordId -> spaced-repetition state. Kept per storage namespace (guest
 * profile or signed-in account), alongside mastery and mock history. */
export type VocabSrsMap = Record<string, SrsRecord>;

function vocabKey(namespace: string): string {
  return `gre-quant:vocab-srs:${namespace}`;
}

/** When signed in, cloud sync registers a listener here so every vocab write
 * is mirrored to Firestore. Null (guest mode) keeps writes local-only. */
let cloudListener: ((map: VocabSrsMap) => void) | null = null;

export function setVocabCloudWriteListener(
  listener: ((map: VocabSrsMap) => void) | null,
): void {
  cloudListener = listener;
}

export function loadVocabSrsForNamespace(namespace: string): VocabSrsMap {
  const raw = localStorage.getItem(vocabKey(namespace));
  if (!raw) return {};
  try {
    return JSON.parse(raw) as VocabSrsMap;
  } catch {
    return {};
  }
}

export function loadVocabSrs(): VocabSrsMap {
  return loadVocabSrsForNamespace(getStorageNamespace());
}

export function saveVocabSrs(map: VocabSrsMap): void {
  localStorage.setItem(vocabKey(getStorageNamespace()), JSON.stringify(map));
  cloudListener?.(map);
}

export function getWordSrs(wordId: string): SrsRecord | undefined {
  return loadVocabSrs()[wordId];
}

export function setWordSrs(wordId: string, record: SrsRecord): void {
  const map = loadVocabSrs();
  map[wordId] = record;
  saveVocabSrs(map);
}

export function clearVocabSrs(): void {
  localStorage.removeItem(vocabKey(getStorageNamespace()));
}
