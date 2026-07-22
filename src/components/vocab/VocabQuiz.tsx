import { useMemo, useState } from "react";
import { allVocabWords, getVocabWord } from "../../lib/vocab";
import { getWordSrs, setWordSrs } from "../../lib/storage/vocab";
import { isGraduated, reviewWord } from "../../lib/srs";

const OPTION_COUNT = 5; // matches GRE verbal single-answer questions

type QuestionKind = "def-to-word" | "word-to-def" | "fill-gap";

interface QuizQuestion {
  targetId: string;
  kind: QuestionKind;
  /** Small heading above the prompt. */
  promptLabel: string;
  /** Main prompt text (a definition, a word, or a cloze sentence). */
  prompt: string;
  /** Whether the prompt should render in the big word style. */
  promptIsWord: boolean;
  /** Options are keyed by word id; the label is a word or a definition. */
  options: { id: string; label: string }[];
  /** Whether options are long text (definitions) -> single column. */
  optionsAreText: boolean;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Replaces the target word (and simple inflections) in its example with a
 * blank. Returns null if the word doesn't appear, so the caller can fall back. */
function blankExample(word: string, example: string): string | null {
  const re = new RegExp(`\\b${escapeRegExp(word)}\\w*`, "i");
  const blanked = example.replace(re, "______");
  return blanked === example ? null : blanked;
}

function makeQuestion(targetId: string): QuizQuestion {
  const target = getVocabWord(targetId)!;
  const distractorIds = shuffle(allVocabWords().filter((w) => w.id !== targetId))
    .slice(0, OPTION_COUNT - 1)
    .map((w) => w.id);
  const ids = shuffle([targetId, ...distractorIds]);

  const kinds: QuestionKind[] = ["def-to-word", "word-to-def", "fill-gap"];
  let kind = kinds[Math.floor(Math.random() * kinds.length)];

  const cloze = kind === "fill-gap" ? blankExample(target.word, target.example) : null;
  if (kind === "fill-gap" && !cloze) kind = "def-to-word";

  if (kind === "word-to-def") {
    return {
      targetId,
      kind,
      promptLabel: "What does this word mean?",
      prompt: target.word,
      promptIsWord: true,
      options: ids.map((id) => ({ id, label: getVocabWord(id)!.definition })),
      optionsAreText: true,
    };
  }

  if (kind === "fill-gap" && cloze) {
    return {
      targetId,
      kind,
      promptLabel: "Complete the sentence:",
      prompt: cloze,
      promptIsWord: false,
      options: ids.map((id) => ({ id, label: getVocabWord(id)!.word })),
      optionsAreText: false,
    };
  }

  return {
    targetId,
    kind: "def-to-word",
    promptLabel: "Which word means:",
    prompt: `“${target.definition}”`,
    promptIsWord: false,
    options: ids.map((id) => ({ id, label: getVocabWord(id)!.word })),
    optionsAreText: false,
  };
}

/**
 * A vocabulary drill that mixes three question types at random: definition ->
 * word, word -> definition, and fill-in-the-gap (the word blanked out of its
 * example sentence).
 *
 * - "learn" mode keeps a word in rotation until it has been answered correctly
 *   enough times to graduate (turn green); missed words come back later.
 * - "review" mode asks each due word once and reschedules it.
 *
 * The word order is shuffled and each answer updates the spaced-repetition
 * schedule immediately.
 */
export function VocabQuiz({
  wordIds,
  mode,
  onDone,
}: {
  wordIds: string[];
  mode: "learn" | "review";
  onDone: () => void;
}) {
  const [queue, setQueue] = useState<string[]>(() => shuffle(wordIds));
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [asked, setAsked] = useState(0);

  const currentId = queue[0];
  const question = useMemo(
    () => (currentId ? makeQuestion(currentId) : null),
    // Rebuild (fresh type + distractors) whenever we advance to a new prompt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentId, round],
  );

  if (!currentId || !question) return null;
  const target = getVocabWord(currentId);
  if (!target) return null;

  const answered = picked !== null;
  const isRight = picked === currentId;
  const learnedCount =
    mode === "learn"
      ? wordIds.filter((id) => isGraduated(getWordSrs(id))).length
      : asked;

  function choose(optionId: string) {
    if (answered) return;
    setPicked(optionId);
    setWordSrs(
      currentId,
      reviewWord(getWordSrs(currentId), optionId === currentId, Date.now()),
    );
  }

  function next() {
    setAsked((n) => n + 1);
    const rest = queue.slice(1);
    const done = mode === "review" || isGraduated(getWordSrs(currentId));
    const nextQueue = done ? rest : [...rest, currentId];
    setPicked(null);
    setRound((r) => r + 1);
    if (nextQueue.length === 0) {
      onDone();
    } else {
      setQueue(nextQueue);
    }
  }

  return (
    <div className="vocab-quiz">
      <p className="vocab-quiz-progress">
        {mode === "learn"
          ? `Learned ${learnedCount} of ${wordIds.length} · question ${asked + 1}`
          : `Word ${asked + 1} of ${wordIds.length}`}
      </p>
      <p className="vocab-quiz-prompt">{question.promptLabel}</p>
      <p
        className={
          question.promptIsWord ? "vocab-quiz-word" : "vocab-quiz-definition"
        }
      >
        {question.prompt}
      </p>
      <div
        className={`vocab-quiz-options${question.optionsAreText ? " vocab-quiz-options-text" : ""}`}
      >
        {question.options.map((option) => {
          const cls = !answered
            ? ""
            : option.id === currentId
              ? " vocab-opt-correct"
              : option.id === picked
                ? " vocab-opt-wrong"
                : "";
          return (
            <button
              key={option.id}
              type="button"
              className={`vocab-opt${cls}`}
              onClick={() => choose(option.id)}
              disabled={answered}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="vocab-quiz-feedback">
          <p className={isRight ? "result-correct" : "result-incorrect"}>
            {isRight ? "Correct" : `Not quite — it's “${target.word}”`}
          </p>
          <p className="vocab-quiz-answer">
            <strong>{target.word}</strong> <em>{target.partOfSpeech}</em> —{" "}
            {target.definition}
          </p>
          <p className="vocab-quiz-example">{target.example}</p>
          <button type="button" onClick={next}>
            Next word
          </button>
        </div>
      )}
    </div>
  );
}
