import { useMemo, useState } from "react";
import { allVocabWords, getVocabWord } from "../../lib/vocab";
import { getWordSrs, setWordSrs } from "../../lib/storage/vocab";
import { reviewWord } from "../../lib/srs";

interface QuizItem {
  wordId: string;
  /** Option word ids (the target plus distractors), shuffled. */
  options: string[];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuiz(wordIds: string[]): QuizItem[] {
  const pool = allVocabWords();
  return wordIds.map((wordId) => {
    const distractors = shuffle(pool.filter((w) => w.id !== wordId))
      .slice(0, 3)
      .map((w) => w.id);
    return { wordId, options: shuffle([wordId, ...distractors]) };
  });
}

/** A definition -> word multiple-choice drill over the given words. Each answer
 * updates that word's spaced-repetition schedule immediately. */
export function VocabQuiz({
  wordIds,
  onDone,
}: {
  wordIds: string[];
  onDone: () => void;
}) {
  const quiz = useMemo(() => buildQuiz(wordIds), [wordIds]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const item = quiz[index];
  const target = getVocabWord(item.wordId);
  if (!target) return null;

  const answered = picked !== null;
  const isRight = picked === item.wordId;

  function choose(optionId: string) {
    if (answered) return;
    setPicked(optionId);
    const correct = optionId === item.wordId;
    if (correct) setCorrectCount((c) => c + 1);
    setWordSrs(item.wordId, reviewWord(getWordSrs(item.wordId), correct, Date.now()));
  }

  function next() {
    if (index + 1 < quiz.length) {
      setIndex(index + 1);
      setPicked(null);
    } else {
      onDone();
    }
  }

  return (
    <div className="vocab-quiz">
      <p className="vocab-quiz-progress">
        Word {index + 1} of {quiz.length} · score {correctCount}
      </p>
      <p className="vocab-quiz-prompt">Which word means:</p>
      <p className="vocab-quiz-definition">“{target.definition}”</p>
      <div className="vocab-quiz-options">
        {item.options.map((optionId) => {
          const option = getVocabWord(optionId);
          const cls = !answered
            ? ""
            : optionId === item.wordId
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
            {index + 1 < quiz.length ? "Next word" : "Finish"}
          </button>
        </div>
      )}
    </div>
  );
}
