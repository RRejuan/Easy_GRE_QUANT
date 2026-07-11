import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLessonForSkill, getQuestionsForSkill, getSkill } from "../lib/content";
import { storageAdapter } from "../lib/storage";
import { computeMastery } from "../lib/mastery";
import { LessonView } from "../components/LessonView";
import { QuestionView, type AnswerResult } from "../components/question/QuestionView";

export function SkillPage() {
  const { skillId = "" } = useParams();
  const skill = getSkill(skillId);
  const lesson = getLessonForSkill(skillId);
  const questions = getQuestionsForSkill(skillId);

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  if (!skill) {
    return (
      <div>
        <p>Skill not found.</p>
        <Link to="/">Back to skill list</Link>
      </div>
    );
  }

  const question = questions[index];

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
    setAnswered(true);
  }

  const mastery = storageAdapter.getSkillMastery(skill.id);

  return (
    <div className="skill-page">
      <Link to="/">&larr; Back to skill list</Link>
      <h1>{skill.name}</h1>
      <p className="skill-description">{skill.description}</p>
      <p>Mastery: {mastery ? computeMastery(mastery) : 0}%</p>

      {lesson && <LessonView lesson={lesson} />}

      <h2>Practice</h2>
      {question ? (
        <>
          <p>
            Question {index + 1} of {questions.length} — session score:{" "}
            {sessionCorrect}/{index + (answered ? 1 : 0)}
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
            <p>
              Drill complete: {sessionCorrect}/{questions.length} correct this
              session.
            </p>
          )}
        </>
      ) : (
        <p>No questions for this skill yet.</p>
      )}
    </div>
  );
}
