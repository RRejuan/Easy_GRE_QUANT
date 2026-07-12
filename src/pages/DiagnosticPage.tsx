import { useState } from "react";
import { Link } from "react-router-dom";
import { buildDiagnostic } from "../lib/diagnostic";
import { storageAdapter } from "../lib/storage";
import { QuestionView, type AnswerResult } from "../components/question/QuestionView";

export function DiagnosticPage() {
  const [questions] = useState(() => buildDiagnostic());
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const question = questions[index];

  function handleAnswered(result: AnswerResult) {
    storageAdapter.recordAttempt({
      questionId: question.id,
      skillId: question.primarySkill,
      correct: result.correct,
      timeSec: result.timeSec,
      timeTargetSec: question.timeTargetSec,
      difficulty: question.difficulty,
    });
    if (result.correct) setCorrectCount((c) => c + 1);
    setAnswered(true);
  }

  return (
    <div className="skill-page">
      <h1>Diagnostic</h1>
      <p>
        A placement check spanning all four areas (Arithmetic, Algebra,
        Geometry, Data Analysis) evenly, to seed your mastery map. Results
        feed directly into the "what to study next" recommendation on the{" "}
        <Link to="/">dashboard</Link>. For a full, timed, section-adaptive
        practice test matching the real GRE Quant format, use{" "}
        <Link to="/mock-test">Mock Test</Link> instead.
      </p>

      {question ? (
        <>
          <p>
            Question {index + 1} of {questions.length} — score:{" "}
            {correctCount}/{index + (answered ? 1 : 0)}
          </p>
          <QuestionView
            key={question.id}
            question={question}
            onAnswered={handleAnswered}
          />
          {answered && index + 1 < questions.length && (
            <button
              type="button"
              onClick={() => {
                setIndex((i) => i + 1);
                setAnswered(false);
              }}
            >
              Next question
            </button>
          )}
          {answered && index + 1 === questions.length && (
            <>
              <p>
                Diagnostic complete: {correctCount}/{questions.length}{" "}
                correct.
              </p>
              <Link to="/">View your dashboard &rarr;</Link>
            </>
          )}
        </>
      ) : (
        <p>No content available yet.</p>
      )}
    </div>
  );
}
