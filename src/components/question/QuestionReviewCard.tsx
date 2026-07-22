import { MathText } from "../MathText";
import { FigureView } from "../FigureView";
import { ChartView } from "../ChartView";
import { fillTemplate } from "../../lib/variables";
import { resolveAnswer, resolveDisplayQuestion, isCorrect } from "./QuestionView";
import { AnsweredOptions } from "./AnsweredOptions";
import type { MockTestQuestionAttempt } from "../../lib/storage";
import type { Question } from "../../types";

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

      <AnsweredOptions
        question={displayQuestion}
        resolvedAnswer={resolvedAnswer}
        userAnswer={attempt.answer}
        correct={correct}
      />

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
