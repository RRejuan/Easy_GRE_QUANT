import { MathText } from "../MathText";
import type { Question } from "../../types";

const QC_LABELS: Record<string, string> = {
  A: "Quantity A is greater",
  B: "Quantity B is greater",
  C: "The two quantities are equal",
  D: "The relationship cannot be determined from the information given",
};

/**
 * Read-only display of a question's options after it has been answered: the
 * correct option is marked, and (when different) the user's chosen wrong option
 * is marked too. Shared by skill practice (QuestionView, right after submitting)
 * and mock-test review (QuestionReviewCard). `question` must already have its
 * {{variables}} resolved for display.
 */
export function AnsweredOptions({
  question,
  resolvedAnswer,
  userAnswer,
  correct,
}: {
  question: Question;
  resolvedAnswer: Question["answer"];
  userAnswer: unknown;
  correct: boolean;
}) {
  const answered = userAnswer !== undefined;

  if (question.type === "QC") {
    return (
      <div className="qc-input">
        <div className="qc-quantities">
          <div>
            <strong>Quantity A</strong>
            <div>
              <MathText text={question.quantityA} />
            </div>
          </div>
          <div>
            <strong>Quantity B</strong>
            <div>
              <MathText text={question.quantityB} />
            </div>
          </div>
        </div>
        <ul className="review-options">
          {(["A", "B", "C", "D"] as const).map((choice) => (
            <li
              key={choice}
              className={
                choice === resolvedAnswer
                  ? "review-option-correct"
                  : choice === userAnswer
                    ? "review-option-chosen-wrong"
                    : undefined
              }
            >
              {QC_LABELS[choice]}
              {choice === resolvedAnswer && " — correct answer"}
              {choice === userAnswer &&
                choice !== resolvedAnswer &&
                " — your answer"}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (question.type === "MC" || question.type === "MultiMC") {
    return (
      <ul className="review-options">
        {question.options.map((option) => {
          const isCorrectOption =
            question.type === "MC"
              ? option.id === resolvedAnswer
              : (resolvedAnswer as string[]).includes(option.id);
          const isChosen =
            question.type === "MC"
              ? option.id === userAnswer
              : ((userAnswer as string[] | undefined) ?? []).includes(option.id);
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
    );
  }

  return (
    <p className="review-numeric">
      Your answer:{" "}
      <strong>{answered ? String(userAnswer) : "(none — skipped)"}</strong>
      {!correct && (
        <>
          {" "}
          — correct answer: <strong>{String(resolvedAnswer)}</strong>
        </>
      )}
    </p>
  );
}
