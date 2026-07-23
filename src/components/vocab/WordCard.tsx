import type { VocabWord } from "../../types";
import { VOCAB_STATE_LABELS, type VocabState } from "../../lib/srs";

/** One vocabulary word in study view, its left border coloured by review state
 * (grey new / green known / yellow due / red needs-review). */
export function WordCard({ word, state }: { word: VocabWord; state: VocabState }) {
  return (
    <li className={`vocab-word-card vocab-state-${state}`}>
      <div className="vocab-word-head">
        <span className="vocab-word-term">{word.word}</span>
        <span className="vocab-word-pos">{word.partOfSpeech}</span>
        <span className={`vocab-word-tier vocab-tier-${word.tier}`}>
          {word.tier}
        </span>
        <span className="vocab-word-state">{VOCAB_STATE_LABELS[state]}</span>
      </div>
      <p className="vocab-word-def">{word.definition}</p>
      <p className="vocab-word-example">{word.example}</p>
      {word.synonyms && word.synonyms.length > 0 && (
        <p className="vocab-word-syn">Synonyms: {word.synonyms.join(", ")}</p>
      )}
    </li>
  );
}
