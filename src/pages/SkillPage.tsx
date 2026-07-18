import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLessonForSkill, getQuestionsForSkill, getSkill } from "../lib/content";
import { storageAdapter } from "../lib/storage";
import { computeMastery } from "../lib/mastery";
import { LessonDefinition, LessonExplanation } from "../components/LessonView";
import { QuestionView, type AnswerResult } from "../components/question/QuestionView";
import { MasteryBar } from "../components/MasteryBar";

export function SkillPage() {
  const { skillId = "" } = useParams();
  const skill = getSkill(skillId);
  const lesson = getLessonForSkill(skillId);
  const questions = getQuestionsForSkill(skillId);

  const [started, setStarted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAttempts, setSessionAttempts] = useState(0);
  // Bumped after each answer so the picker re-reads statuses from storage.
  const [, setStatusVersion] = useState(0);

  if (!skill) {
    return (
      <div>
        <p>Skill not found.</p>
        <Link to="/skills">Back to skill list</Link>
      </div>
    );
  }

  const statuses = storageAdapter.getQuestionStatuses(skill.id);
  const question = questions[index];

  function handleStart() {
    // Resume where they left off: first question they've never attempted.
    const firstNew = questions.findIndex((q) => !(q.id in statuses));
    setIndex(firstNew === -1 ? 0 : firstNew);
    setStarted(true);
  }

  function handleJump(toIndex: number) {
    if (toIndex === index) return;
    setIndex(toIndex);
    setAnswered(false);
  }

  function handleAnswered(result: AnswerResult) {
    storageAdapter.recordAttempt({
      questionId: question.id,
      skillId: skill!.id,
      correct: result.correct,
      timeSec: result.timeSec,
      timeTargetSec: question.timeTargetSec,
      difficulty: question.difficulty,
    });
    if (result.correct) setSessionCorrect((c) => c + 1);
    setSessionAttempts((n) => n + 1);
    setAnswered(true);
    setStatusVersion((v) => v + 1);
  }

  const mastery = storageAdapter.getSkillMastery(skill.id);

  return (
    <div className="skill-page">
      <Link to="/skills">&larr; Back to skill list</Link>
      <h1>{skill.name}</h1>
      <p className="skill-description">{skill.description}</p>
      <p>
        Mastery: <MasteryBar percent={mastery ? computeMastery(mastery) : 0} />
      </p>

      {!started && (
        <>
          {lesson && <LessonDefinition lesson={lesson} />}
          {questions.length > 0 && (
            <button type="button" onClick={handleStart}>
              Let's try problems
            </button>
          )}
        </>
      )}

      {started && (
        <>
          <h2>Practice</h2>
          {question ? (
            <>
              <div className="question-picker" aria-label="Jump to a question">
                {questions.map((q, i) => {
                  const status =
                    q.id in statuses
                      ? statuses[q.id]
                        ? "correct"
                        : "wrong"
                      : "new";
                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={`question-picker-btn question-picker-${status}${
                        i === index ? " question-picker-current" : ""
                      }`}
                      onClick={() => handleJump(i)}
                      title={
                        status === "new"
                          ? `Question ${i + 1} (not tried yet)`
                          : `Question ${i + 1} (last attempt ${status})`
                      }
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <p>
                Question {index + 1} of {questions.length}
                {sessionAttempts > 0 &&
                  ` — session score: ${sessionCorrect}/${sessionAttempts}`}
              </p>
              <QuestionView
                key={question.id}
                question={question}
                onAnswered={handleAnswered}
              />
              {lesson && (
                <div className="explanation-toggle">
                  <button
                    type="button"
                    onClick={() => setShowExplanation((v) => !v)}
                  >
                    {showExplanation ? "Hide" : "Show"} explanation
                  </button>
                  {showExplanation && <LessonExplanation lesson={lesson} />}
                </div>
              )}
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
                <p>You've reached the last question in this skill's pool.</p>
              )}
            </>
          ) : (
            <p>No questions for this skill yet.</p>
          )}
        </>
      )}
    </div>
  );
}
