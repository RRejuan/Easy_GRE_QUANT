import { useEffect, useMemo, useRef, useState } from "react";
import type { Question } from "../../types";
import { MathText } from "../MathText";
import { FigureView } from "../FigureView";
import { ChartView } from "../ChartView";
import { QCInput } from "./QCInput";
import { MCInput } from "./MCInput";
import { MultiMCInput } from "./MultiMCInput";
import { NumericInput } from "./NumericInput";
import { AnsweredOptions } from "./AnsweredOptions";
import { ReportQuestionButton } from "./ReportQuestionButton";
import { evalFormula, fillTemplate, resolveVariables } from "../../lib/variables";

export interface AnswerResult {
  correct: boolean;
  timeSec: number;
  answer: unknown;
  values: Record<string, number>;
}

function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

export function resolveDisplayQuestion(question: Question, values: Record<string, number>): Question {
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

export function resolveAnswer(question: Question, values: Record<string, number>): Question["answer"] {
  if (
    question.type === "Numeric" &&
    question.answerFormula &&
    Object.keys(values).length > 0
  ) {
    return evalFormula(question.answerFormula, values);
  }
  return question.answer;
}

export function isCorrect(question: Question, answer: unknown, resolvedAnswer: unknown): boolean {
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
  deferFeedback = false,
  showTimer = true,
  initialAnswer,
}: {
  question: Question;
  onAnswered: (result: AnswerResult) => void;
  /** In mock-test mode: never reveal correctness/solution, and keep the input editable so the student can change their answer before moving on. */
  deferFeedback?: boolean;
  /** Whether the elapsed/target time readout is visible. Real GRE sections have no visible per-question clock. */
  showTimer?: boolean;
  /** Restores a previously-given answer when revisiting a question (mock-test navigation). */
  initialAnswer?: unknown;
}) {
  const [submittedAnswer, setSubmittedAnswer] = useState<unknown>(initialAnswer);
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
    setSubmittedAnswer(initialAnswer);
    setShowShortcut(false);
    setElapsedSec(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  useEffect(() => {
    if (submittedAnswer !== undefined && !deferFeedback) return;
    const interval = setInterval(() => {
      setElapsedSec((performance.now() - startRef.current) / 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [question.id, submittedAnswer, deferFeedback]);

  function handleSubmit(answer: unknown) {
    const timeSec = (performance.now() - startRef.current) / 1000;
    setSubmittedAnswer(answer);
    setFinalTimeSec(timeSec);
    onAnswered({ correct: isCorrect(question, answer, resolvedAnswer), timeSec, answer, values });
  }

  const answered = submittedAnswer !== undefined;
  const locked = answered && !deferFeedback;
  const correct = locked && isCorrect(question, submittedAnswer, resolvedAnswer);
  const target = question.timeTargetSec;
  const overTarget = !locked && elapsedSec > target;
  const displayedTimeSec = locked ? finalTimeSec : elapsedSec;

  return (
    <div className="question">
      {showTimer && (
        <div className={`question-timer${overTarget ? " question-timer-over" : ""}`}>
          <span className="question-timer-elapsed">⏱ {formatTime(displayedTimeSec)}</span>
          <span className="question-timer-target">target {formatTime(target)}</span>
          {locked ? (
            <span className="question-timer-recap">
              {displayedTimeSec <= target
                ? `${formatTime(target - displayedTimeSec)} under target`
                : `${formatTime(displayedTimeSec - target)} over target`}
            </span>
          ) : (
            overTarget && <span className="question-timer-warning">over target — move on if stuck</span>
          )}
        </div>
      )}
      {question.passage && (
        <div className="question-passage">
          {question.passage.split(/\n\n+/).map((para, i) => (
            <p key={i}>
              <MathText text={para} />
            </p>
          ))}
        </div>
      )}
      <p className="question-stem">
        <MathText text={displayQuestion.stem} />
      </p>

      {question.figure && <FigureView figure={question.figure} values={values} />}
      {question.chart && <ChartView chart={question.chart} values={values} />}

      {!locked && displayQuestion.type === "QC" && (
        <QCInput
          question={displayQuestion}
          onSubmit={handleSubmit}
          initialAnswer={submittedAnswer as "A" | "B" | "C" | "D" | undefined}
          autoRecord={deferFeedback}
        />
      )}
      {!locked && displayQuestion.type === "MC" && (
        <MCInput
          question={displayQuestion}
          onSubmit={handleSubmit}
          initialAnswer={submittedAnswer as string | undefined}
          autoRecord={deferFeedback}
        />
      )}
      {!locked && displayQuestion.type === "MultiMC" && (
        <MultiMCInput
          question={displayQuestion}
          onSubmit={handleSubmit}
          initialAnswer={submittedAnswer as string[] | undefined}
          autoRecord={deferFeedback}
        />
      )}
      {!locked && displayQuestion.type === "Numeric" && (
        <NumericInput
          onSubmit={handleSubmit}
          initialAnswer={submittedAnswer as number | undefined}
          autoRecord={deferFeedback}
        />
      )}

      {/* After submitting in skill practice, keep the options visible with the
          chosen and correct answers marked, above the verdict and solution. */}
      {locked && (
        <AnsweredOptions
          question={displayQuestion}
          resolvedAnswer={resolvedAnswer}
          userAnswer={submittedAnswer}
          correct={correct}
        />
      )}

      {deferFeedback && answered && (
        <p className="answer-saved-hint">Answer saved. You can change it or move to another question.</p>
      )}

      {locked && (
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

      {/* In mock-test mode the report control only appears after answering,
          so it can't leak a hint that something about the question is off. */}
      {(answered || !deferFeedback) && (
        <ReportQuestionButton question={question} values={values} />
      )}
    </div>
  );
}
