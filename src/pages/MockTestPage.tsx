import { useState } from "react";
import { Link } from "react-router-dom";
import {
  SECTION1_TIME_SEC,
  SECTION2_TIME_SEC,
  assembleSection1,
  assembleSection2,
  determineTier,
  estimateScore,
  type Tier,
} from "../lib/mockTest";
import { useCountdown } from "../lib/useCountdown";
import { Calculator } from "../components/Calculator";
import { QuestionView, type AnswerResult } from "../components/question/QuestionView";
import type { Question } from "../types";

type Phase = "section1" | "section2" | "results";

interface SectionState {
  questions: Question[];
  index: number;
  answered: boolean;
  correct: number;
}

export function MockTestPage() {
  const [phase, setPhase] = useState<Phase>("section1");
  const [section1, setSection1] = useState<SectionState>(() => ({
    questions: assembleSection1(),
    index: 0,
    answered: false,
    correct: 0,
  }));
  const [section2, setSection2] = useState<SectionState | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  function finishSection1() {
    const finalTier = determineTier(section1.correct, section1.questions.length);
    setTier(finalTier);
    const excludeIds = new Set(section1.questions.map((q) => q.id));
    setSection2({
      questions: assembleSection2(finalTier, excludeIds),
      index: 0,
      answered: false,
      correct: 0,
    });
    setPhase("section2");
  }

  function finishSection2() {
    setPhase("results");
  }

  const section1Timer = useCountdown(
    SECTION1_TIME_SEC,
    phase === "section1",
    finishSection1,
  );
  const section2Timer = useCountdown(
    SECTION2_TIME_SEC,
    phase === "section2",
    finishSection2,
  );

  function handleSection1Answered(result: AnswerResult) {
    setSection1((s) => ({
      ...s,
      answered: true,
      correct: s.correct + (result.correct ? 1 : 0),
    }));
  }

  function handleSection2Answered(result: AnswerResult) {
    setSection2((s) =>
      s
        ? { ...s, answered: true, correct: s.correct + (result.correct ? 1 : 0) }
        : s,
    );
  }

  function nextInSection1() {
    setSection1((s) => {
      if (s.index + 1 >= s.questions.length) return s;
      return { ...s, index: s.index + 1, answered: false };
    });
  }

  function nextInSection2() {
    setSection2((s) => {
      if (!s) return s;
      if (s.index + 1 >= s.questions.length) return s;
      return { ...s, index: s.index + 1, answered: false };
    });
  }

  const calculatorToggle = (
    <button type="button" onClick={() => setShowCalculator((v) => !v)}>
      {showCalculator ? "Hide" : "Show"} calculator
    </button>
  );

  if (phase === "section1") {
    const question = section1.questions[section1.index];
    const isLast = section1.index + 1 >= section1.questions.length;
    return (
      <div className="skill-page">
        <Link to="/">&larr; Back to skill list</Link>
        <h1>Mock Test — Section 1</h1>
        <p>
          Question {section1.index + 1} of {section1.questions.length} — time
          remaining: {section1Timer.label}
        </p>
        {calculatorToggle}
        {showCalculator && <Calculator />}
        {question && (
          <QuestionView
            key={question.id}
            question={question}
            onAnswered={handleSection1Answered}
          />
        )}
        {section1.answered && !isLast && (
          <button type="button" onClick={nextInSection1}>
            Next question
          </button>
        )}
        {section1.answered && isLast && (
          <button type="button" onClick={finishSection1}>
            Finish Section 1 &rarr;
          </button>
        )}
      </div>
    );
  }

  if (phase === "section2" && section2) {
    const question = section2.questions[section2.index];
    const isLast = section2.index + 1 >= section2.questions.length;
    return (
      <div className="skill-page">
        <h1>Mock Test — Section 2 ({tier})</h1>
        <p>
          Question {section2.index + 1} of {section2.questions.length} — time
          remaining: {section2Timer.label}
        </p>
        {calculatorToggle}
        {showCalculator && <Calculator />}
        {question ? (
          <QuestionView
            key={question.id}
            question={question}
            onAnswered={handleSection2Answered}
          />
        ) : (
          <p>Not enough questions available yet for this difficulty tier.</p>
        )}
        {section2.answered && !isLast && (
          <button type="button" onClick={nextInSection2}>
            Next question
          </button>
        )}
        {(section2.answered && isLast) || !question ? (
          <button type="button" onClick={finishSection2}>
            Finish test &rarr;
          </button>
        ) : null}
      </div>
    );
  }

  const totalCorrect = section1.correct + (section2?.correct ?? 0);
  const totalQuestions = section1.questions.length + (section2?.questions.length ?? 0);
  const score = estimateScore(totalCorrect, totalQuestions, tier ?? "medium");

  return (
    <div className="skill-page">
      <Link to="/">&larr; Back to skill list</Link>
      <h1>Mock Test — Results</h1>
      <p>
        Section 1: {section1.correct}/{section1.questions.length} correct.
      </p>
      <p>
        Section 2 ({tier}): {section2?.correct ?? 0}/{section2?.questions.length ?? 0}{" "}
        correct.
      </p>
      <p>
        Total: {totalCorrect}/{totalQuestions} correct.
      </p>
      <p>
        <strong>Estimated score: {score} / 170</strong>
      </p>
      <p>
        This is a rough estimate from the current pool, not ETS's official
        concordance table — treat it as directional until dedicated,
        difficulty-calibrated mock content is built out.
      </p>
    </div>
  );
}
