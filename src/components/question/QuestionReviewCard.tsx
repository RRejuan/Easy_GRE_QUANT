import { MathText } from "../MathText";
import { FigureView } from "../FigureView";
import { ChartView } from "../ChartView";
import { fillTemplate } from "../../lib/variables";
import { resolveAnswer, resolveDisplayQuestion, isCorrect } from "./QuestionView";
import type { MockTestQuestionAttempt } from "../../lib/storage";
import type { Question } from "../../types";

const QC_LABELS: Record<string, string> = {
  A: "Quantity A is greater",
  B: "Quantity B is greater",
  C: "The two quantities are equal",
  D: "The relationship cannot be determined from the information given",
};

/** Read-only summary of one mock-test question, shown during post-test review. Re-renders the exact randomized instance the student saw by reusing the `values` recorded at attempt time, rather than re-rolling variables. */
export function QuestionReviewCard({
  question,
  attempt,
  index,
}: {
  question: Question;
  attempt: MockTestQuestionAttempt;
  index: number;
}) {
  const values = attempt.values;
  const displayQuestion = resolveDisplayQuestion(question, values);
  const resolvedAnswer = resolveAnswer(question, values);
  const solutionStandard = fillTemplate(question.solutionStandard, values);
  const solutionShortcut = question.solutionShortcut
    ? fillTemplate(question.solutionShortcut, values)
    : undefined;

  const answered = attempt.answer !== undefined;
  const correct = answered && isCorrect(question, attempt.answer, resolvedAnswer);

  return (
    <div className={`review-card${correct ? " review-card-correct" : answered ? " review-card-incorrect" : " review-card-skipped"}`}>
      <div className="review-card-header">
        <span>Question {index + 1}</span>
        <span className={correct ? "result-correct" : answered ? "result-incorrect" : "result-skipped"}>
          {correct ? "Correct" : answered ? "Incorrect" : "Skipped"}
        </span>
      </div>
      <p className="question-stem">
        <MathText text={displayQuestion.stem} />
      </p>

      {question.figure && <FigureView figure={question.figure} values={values} />}
      {question.chart && <ChartView chart={question.chart} values={values} />}

      {displayQuestion.type === "QC" && (
        <div className="qc-input">
          <div className="qc-quantities">
            <div>
              <strong>Quantity A</strong>
              <div><MathText text={displayQuestion.quantityA} /></div>
            </div>
            <div>
              <strong>Quantity B</strong>
              <div><MathText text={displayQuestion.quantityB} /></div>
            </div>
          </div>
          <ul className="review-options">
            {(["A", "B", "C", "D"] as const).map((choice) => (
              <li
                key={choice}
                className={
                  choice === resolvedAnswer
                    ? "review-option-correct"
                    : choice === attempt.answer
                      ? "review-option-chosen-wrong"
                      : undefined
                }
              >
                {QC_LABELS[choice]}
                {choice === resolvedAnswer && " — correct answer"}
                {choice === attempt.answer && choice !== resolvedAnswer && " — your answer"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(displayQuestion.type === "MC" || displayQuestion.type === "MultiMC") && (
        <ul className="review-options">
          {displayQuestion.options.map((option) => {
            const isCorrectOption =
              displayQuestion.type === "MC"
                ? option.id === resolvedAnswer
                : (resolvedAnswer as string[]).includes(option.id);
            const isChosen =
              displayQuestion.type === "MC"
                ? option.id === attempt.answer
                : ((attempt.answer as string[] | undefined) ?? []).includes(option.id);
            const className = isCorrectOption
              ? "review-option-correct"
              : isChosen
                ? "review-option-chosen-wrong"
                : undefined;
            return (
              <li key={option.id} className={className}>
                <MathText text={option.text} />
                {isCorrectOption && " — correct answer"}
                {isChosen && !isCorrectOption && " — your answer"}
              </li>
            );
          })}
        </ul>
      )}

      {displayQuestion.type === "Numeric" && (
        <p className="review-numeric">
          Your answer: <strong>{answered ? String(attempt.answer) : "(none — skipped)"}</strong>
          {!correct && (
            <>
              {" "}— correct answer: <strong>{String(resolvedAnswer)}</strong>
            </>
          )}
        </p>
      )}

      <div className="solution">
        <h4>Standard solution</h4>
        <p>
          <MathText text={solutionStandard} />
        </p>
        {solutionShortcut && (
          <>
            <h4>Shortcut</h4>
            <p>
              <MathText text={solutionShortcut} />
            </p>
          </>
        )}
      </div>
    </div>
  );
}
