import { useMemo, useState } from "react";
import { allVocabWords, getVocabWord } from "../../lib/vocab";
import { getWordSrs, setWordSrs } from "../../lib/storage/vocab";
import { isGraduated, reviewWord } from "../../lib/srs";

const OPTION_COUNT = 5; // matches GRE verbal single-answer questions

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildOptions(targetId: string): string[] {
  const distractors = shuffle(allVocabWords().filter((w) => w.id !== targetId))
    .slice(0, OPTION_COUNT - 1)
    .map((w) => w.id);
  return shuffle([targetId, ...distractors]);
}

/**
 * A definition -> word drill.
 *
 * - "learn" mode: keeps a word in rotation until it has been answered correctly
 *   enough times to graduate (turn green); missed words come back later in the
 *   session. With ~15 words that yields 30+ questions.
 * - "review" mode: asks each due word once and reschedules it.
 *
 * The word order is shuffled, and each answer updates the spaced-repetition
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
  const options = useMemo(
    () => (currentId ? buildOptions(currentId) : []),
    // Rebuild (fresh distractors) whenever we advance to a new prompt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentId, round],
  );

  if (!currentId) return null;
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
    // In learn mode, requeue a word until it has graduated (turned green).
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
      <p className="vocab-quiz-prompt">Which word means:</p>
      <p className="vocab-quiz-definition">“{target.definition}”</p>
      <div className="vocab-quiz-options">
        {options.map((optionId) => {
          const option = getVocabWord(optionId);
          const cls = !answered
            ? ""
            : optionId === currentId
              ? " vocab-opt-correct"
              : optionId === picked
                ? " vocab-opt-wrong"
                : "";
          return (
            <button
              key={optionId}
              type="button"
              className={`vocab-opt${cls}`}
              onClick={() => choose(optionId)}
              disabled={answered}
            >
              {option?.word ?? optionId}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="vocab-quiz-feedback">
          <p className={isRight ? "result-correct" : "result-incorrect"}>
            {isRight ? "Correct" : `Not quite — it's “${target.word}”`}
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
