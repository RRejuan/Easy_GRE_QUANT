import type { SrsRecord } from "../srs";
import { getStorageNamespace } from "./namespace";

/** wordId -> spaced-repetition state. Kept per storage namespace (guest
 * profile or signed-in account), alongside mastery and mock history. */
export type VocabSrsMap = Record<string, SrsRecord>;

function vocabKey(namespace: string): string {
  return `gre-quant:vocab-srs:${namespace}`;
}

export function loadVocabSrs(): VocabSrsMap {
  const raw = localStorage.getItem(vocabKey(getStorageNamespace()));
  if (!raw) return {};
  try {
    return JSON.parse(raw) as VocabSrsMap;
  } catch {
    return {};
  }
}

export function saveVocabSrs(map: VocabSrsMap): void {
  localStorage.setItem(vocabKey(getStorageNamespace()), JSON.stringify(map));
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
