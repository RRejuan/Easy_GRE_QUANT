import { useEffect, useMemo, useRef, useState } from "react";
import type { Question } from "../../types";
import { MathText } from "../MathText";
import { FigureView } from "../FigureView";
import { ChartView } from "../ChartView";
import { QCInput } from "./QCInput";
import { MCInput } from "./MCInput";
import { MultiMCInput } from "./MultiMCInput";
import { NumericInput } from "./NumericInput";
import { evalFormula, fillTemplate, resolveVariables } from "../../lib/variables";

export interface AnswerResult {
  correct: boolean;
  timeSec: number;
}

function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

function resolveDisplayQuestion(question: Question, values: Record<string, number>): Question {
  if (!question.variables || question.variables.length === 0) return question;

  const withStem = { ...question, stem: fillTemplate(question.stem, values) };

  if (withStem.type === "QC") {
    return {
      ...withStem,
      quantityA: fillTemplate(withStem.quantityA, values),
      quantityB: fillTemplate(withStem.quantityB, values),
    };
  }
  if (withStem.type === "MC" || withStem.type === "MultiMC") {
    return {
      ...withStem,
      options: withStem.options.map((o) => ({ ...o, text: fillTemplate(o.text, values) })),
    };
  }
  return withStem;
}

function resolveAnswer(question: Question, values: Record<string, number>): Question["answer"] {
  if (
    question.type === "Numeric" &&
    question.answerFormula &&
    Object.keys(values).length > 0
  ) {
    return evalFormula(question.answerFormula, values);
  }
  return question.answer;
}

function isCorrect(question: Question, answer: unknown, resolvedAnswer: unknown): boolean {
  switch (question.type) {
    case "MultiMC": {
      const given = new Set(answer as string[]);
      const expected = new Set(resolvedAnswer as string[]);
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
      return value === resolvedAnswer;
    }
    default:
      return answer === resolvedAnswer;
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
  const [elapsedSec, setElapsedSec] = useState(0);
  const [finalTimeSec, setFinalTimeSec] = useState(0);
  const startRef = useRef(performance.now());

  const [values] = useState(() => resolveVariables(question.variables));
  const displayQuestion = useMemo(
    () => resolveDisplayQuestion(question, values),
    [question, values],
  );
  const resolvedAnswer = useMemo(
    () => resolveAnswer(question, values),
    [question, values],
  );
  const solutionStandard = useMemo(
    () => fillTemplate(question.solutionStandard, values),
    [question, values],
  );
  const solutionShortcut = useMemo(
    () => (question.solutionShortcut ? fillTemplate(question.solutionShortcut, values) : undefined),
    [question, values],
  );

  useEffect(() => {
    startRef.current = performance.now();
    setSubmittedAnswer(undefined);
    setShowShortcut(false);
    setElapsedSec(0);
  }, [question.id]);

  useEffect(() => {
    if (submittedAnswer !== undefined) return;
    const interval = setInterval(() => {
      setElapsedSec((performance.now() - startRef.current) / 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [question.id, submittedAnswer]);

  function handleSubmit(answer: unknown) {
    const timeSec = (performance.now() - startRef.current) / 1000;
    setSubmittedAnswer(answer);
    setFinalTimeSec(timeSec);
    onAnswered({ correct: isCorrect(question, answer, resolvedAnswer), timeSec });
  }

  const submitted = submittedAnswer !== undefined;
  const correct = submitted && isCorrect(question, submittedAnswer, resolvedAnswer);
  const target = question.timeTargetSec;
  const overTarget = !submitted && elapsedSec > target;
  const displayedTimeSec = submitted ? finalTimeSec : elapsedSec;

  return (
    <div className="question">
      <div className={`question-timer${overTarget ? " question-timer-over" : ""}`}>
        <span className="question-timer-elapsed">⏱ {formatTime(displayedTimeSec)}</span>
        <span className="question-timer-target">target {formatTime(target)}</span>
        {submitted ? (
          <span className="question-timer-recap">
            {displayedTimeSec <= target
              ? `${formatTime(target - displayedTimeSec)} under target`
              : `${formatTime(displayedTimeSec - target)} over target`}
          </span>
        ) : (
          overTarget && <span className="question-timer-warning">over target — move on if stuck</span>
        )}
      </div>
      <p className="question-stem">
        <MathText text={displayQuestion.stem} />
      </p>

      {question.figure && <FigureView figure={question.figure} values={values} />}
      {question.chart && <ChartView chart={question.chart} values={values} />}

      {!submitted && displayQuestion.type === "QC" && (
        <QCInput question={displayQuestion} onSubmit={handleSubmit} />
      )}
      {!submitted && displayQuestion.type === "MC" && (
        <MCInput question={displayQuestion} onSubmit={handleSubmit} />
      )}
      {!submitted && displayQuestion.type === "MultiMC" && (
        <MultiMCInput question={displayQuestion} onSubmit={handleSubmit} />
      )}
      {!submitted && displayQuestion.type === "Numeric" && (
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
              <MathText text={solutionStandard} />
            </p>
            {solutionShortcut && (
              <>
                <button type="button" onClick={() => setShowShortcut((v) => !v)}>
                  {showShortcut ? "Hide" : "Show"} shortcut
                </button>
                {showShortcut && (
                  <p>
                    <MathText text={solutionShortcut} />
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
