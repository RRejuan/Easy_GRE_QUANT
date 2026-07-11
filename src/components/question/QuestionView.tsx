import { useEffect, useRef, useState } from "react";
import type { Question } from "../../types";
import { MathText } from "../MathText";
import { QCInput } from "./QCInput";
import { MCInput } from "./MCInput";
import { MultiMCInput } from "./MultiMCInput";
import { NumericInput } from "./NumericInput";

export interface AnswerResult {
  correct: boolean;
  timeSec: number;
}

function isCorrect(question: Question, answer: unknown): boolean {
  switch (question.type) {
    case "MultiMC": {
      const given = new Set(answer as string[]);
      const expected = new Set(question.answer);
      return (
        given.size === expected.size &&
        [...expected].every((id) => given.has(id))
      );
    }
    case "Numeric": {
      const value = answer as number;
      if (question.acceptableRange) {
        const [min, max] = question.acceptableRange;
        return value >= min && value <= max;
      }
      return value === question.answer;
    }
    default:
      return answer === question.answer;
  }
}

export function QuestionView({
  question,
  onAnswered,
}: {
  question: Question;
  onAnswered: (result: AnswerResult) => void;
}) {
  const [submittedAnswer, setSubmittedAnswer] = useState<unknown>(undefined);
  const [showShortcut, setShowShortcut] = useState(false);
  const startRef = useRef(performance.now());

  useEffect(() => {
    startRef.current = performance.now();
    setSubmittedAnswer(undefined);
    setShowShortcut(false);
  }, [question.id]);

  function handleSubmit(answer: unknown) {
    const timeSec = (performance.now() - startRef.current) / 1000;
    setSubmittedAnswer(answer);
    onAnswered({ correct: isCorrect(question, answer), timeSec });
  }

  const submitted = submittedAnswer !== undefined;
  const correct = submitted && isCorrect(question, submittedAnswer);

  return (
    <div className="question">
      <p className="question-stem">
        <MathText text={question.stem} />
      </p>

      {!submitted && question.type === "QC" && (
        <QCInput question={question} onSubmit={handleSubmit} />
      )}
      {!submitted && question.type === "MC" && (
        <MCInput question={question} onSubmit={handleSubmit} />
      )}
      {!submitted && question.type === "MultiMC" && (
        <MultiMCInput question={question} onSubmit={handleSubmit} />
      )}
      {!submitted && question.type === "Numeric" && (
        <NumericInput onSubmit={handleSubmit} />
      )}

      {submitted && (
        <div className="question-result">
          <p className={correct ? "result-correct" : "result-incorrect"}>
            {correct ? "Correct" : "Incorrect"}
          </p>
          <div className="solution">
            <h4>Standard solution</h4>
            <p>
              <MathText text={question.solutionStandard} />
            </p>
            {question.solutionShortcut && (
              <>
                <button type="button" onClick={() => setShowShortcut((v) => !v)}>
                  {showShortcut ? "Hide" : "Show"} shortcut
                </button>
                {showShortcut && (
                  <p>
                    <MathText text={question.solutionShortcut} />
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
