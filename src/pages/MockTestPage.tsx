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
import { ChartView } from "../components/ChartView";
import { QuestionView, type AnswerResult } from "../components/question/QuestionView";
import { QuestionReviewCard } from "../components/question/QuestionReviewCard";
import { getQuestionById } from "../lib/content";
import {
  storageAdapter,
  type MockTestResult,
  type MockTestSectionResult,
} from "../lib/storage";
import type { LineChart, Question } from "../types";

type Phase = "landing" | "section1" | "section2" | "review";
type SectionKey = "section1" | "section2";

interface QuestionAttemptState {
  answer: unknown;
  correct: boolean;
  timeSec: number;
  values: Record<string, number>;
}

interface SectionState {
  questions: Question[];
  attempts: (QuestionAttemptState | undefined)[];
  index: number;
}

function makeSectionState(questions: Question[]): SectionState {
  return { questions, attempts: questions.map(() => undefined), index: 0 };
}

function toSectionResult(section: SectionState, tier?: Tier): MockTestSectionResult {
  return {
    tier,
    questions: section.questions.map((q, i) => {
      const a = section.attempts[i];
      return {
        questionId: q.id,
        values: a?.values ?? {},
        answer: a?.answer,
        correct: a?.correct ?? false,
        timeSec: a?.timeSec ?? 0,
      };
    }),
  };
}

function countCorrect(result: MockTestSectionResult): number {
  return result.questions.filter((q) => q.correct).length;
}

export function MockTestPage() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [section1, setSection1] = useState<SectionState>(() =>
    makeSectionState(assembleSection1()),
  );
  const [section2, setSection2] = useState<SectionState | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [history, setHistory] = useState<MockTestResult[]>(() =>
    storageAdapter.getMockTestHistory(),
  );
  const [completedResult, setCompletedResult] = useState<MockTestResult | null>(null);

  function startTest() {
    setSection1(makeSectionState(assembleSection1()));
    setSection2(null);
    setTier(null);
    setCompletedResult(null);
    setPhase("section1");
  }

  function finishSection1() {
    const correctCount = section1.attempts.filter((a) => a?.correct).length;
    const finalTier = determineTier(correctCount, section1.questions.length);
    setTier(finalTier);
    const excludeIds = new Set(section1.questions.map((q) => q.id));
    setSection2(makeSectionState(assembleSection2(finalTier, excludeIds)));
    setPhase("section2");
  }

  function finishSection2() {
    if (!section2) return;
    const finalTier = tier ?? "medium";
    const section1Result = toSectionResult(section1);
    const section2Result = toSectionResult(section2, finalTier);
    const totalCorrect = countCorrect(section1Result) + countCorrect(section2Result);
    const totalQuestions = section1Result.questions.length + section2Result.questions.length;
    const result: MockTestResult = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      section1: section1Result,
      section2: section2Result,
      estimatedScore: estimateScore(totalCorrect, totalQuestions, finalTier),
    };
    storageAdapter.recordMockTestResult(result);
    setHistory(storageAdapter.getMockTestHistory());
    setCompletedResult(result);
    setPhase("review");
  }

  function attemptFinishSection1() {
    const unanswered = section1.attempts.filter((a) => a === undefined).length;
    if (
      unanswered > 0 &&
      !window.confirm(
        `You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"} in this section. Finish anyway?`,
      )
    ) {
      return;
    }
    finishSection1();
  }

  function attemptFinishSection2() {
    if (!section2) return;
    const unanswered = section2.attempts.filter((a) => a === undefined).length;
    if (
      unanswered > 0 &&
      !window.confirm(
        `You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Finish the test anyway?`,
      )
    ) {
      return;
    }
    finishSection2();
  }

  function handleAnswered(section: SectionKey, index: number, result: AnswerResult) {
    const update = (s: SectionState): SectionState => {
      const attempts = [...s.attempts];
      attempts[index] = {
        answer: result.answer,
        correct: result.correct,
        timeSec: result.timeSec,
        values: result.values,
      };
      return { ...s, attempts };
    };
    if (section === "section1") setSection1(update);
    else setSection2((s) => (s ? update(s) : s));
  }

  function goTo(section: SectionKey, i: number) {
    if (section === "section1") {
      setSection1((s) => ({ ...s, index: Math.max(0, Math.min(i, s.questions.length - 1)) }));
    } else {
      setSection2((s) =>
        s ? { ...s, index: Math.max(0, Math.min(i, s.questions.length - 1)) } : s,
      );
    }
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

  const calculatorToggle = (
    <button type="button" onClick={() => setShowCalculator((v) => !v)}>
      {showCalculator ? "Hide" : "Show"} calculator
    </button>
  );
  const timerToggle = (
    <button type="button" onClick={() => setShowTimer((v) => !v)}>
      {showTimer ? "Hide" : "Show"} timer &amp; target time
    </button>
  );

  function renderPalette(section: SectionState, onSelect: (i: number) => void) {
    return (
      <div className="mock-palette">
        {section.questions.map((q, i) => {
          const state =
            i === section.index ? "current" : section.attempts[i] ? "answered" : "unanswered";
          return (
            <button
              key={q.id}
              type="button"
              className={`mock-palette-item mock-palette-${state}`}
              onClick={() => onSelect(i)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    );
  }

  if (phase === "landing") {
    const scoreChart: LineChart = {
      kind: "line",
      title: "Estimated score history",
      yLabel: "Score",
      points: history.map((h, i) => ({ x: `#${i + 1}`, y: h.estimatedScore })),
    };
    return (
      <div className="skill-page">
        <Link to="/">&larr; Back to skill list</Link>
        <h1>Mock Test</h1>
        <p>
          A full, timed, section-adaptive GRE Quant mock: Section 1 (12
          questions, 21 minutes) determines your Section 2 difficulty (15
          questions, 26 minutes), just like the real exam. Section 2 draws
          from a harder pool than skill practice. Feedback is withheld until
          you finish the whole test — you can review every question and its
          full explanation afterward.
        </p>
        {history.length > 0 && (
          <div className="mock-history">
            <h2>Your mock test history</h2>
            {history.length > 1 && <ChartView chart={scoreChart} values={{}} />}
            <ul className="mock-history-list">
              {history
                .slice()
                .reverse()
                .map((h) => (
                  <li key={h.id}>
                    <span>{new Date(h.date).toLocaleDateString()}</span>
                    <span>Score: {h.estimatedScore}</span>
                    <span>
                      {countCorrect(h.section1) + countCorrect(h.section2)}/
                      {h.section1.questions.length + h.section2.questions.length} correct
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCompletedResult(h);
                        setPhase("review");
                      }}
                    >
                      Review
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}
        <button type="button" onClick={startTest}>
          Start a new mock test &rarr;
        </button>
      </div>
    );
  }

  if (phase === "section1") {
    const question = section1.questions[section1.index];
    const attempt = section1.attempts[section1.index];
    return (
      <div className="skill-page">
        <h1>Mock Test — Section 1</h1>
        <p>
          Question {section1.index + 1} of {section1.questions.length} — time
          remaining: {section1Timer.label}
        </p>
        <div className="mock-toolbar">
          {calculatorToggle}
          {timerToggle}
        </div>
        {showCalculator && <Calculator />}
        {renderPalette(section1, (i) => goTo("section1", i))}
        {question && (
          <QuestionView
            key={question.id}
            question={question}
            deferFeedback
            showTimer={showTimer}
            initialAnswer={attempt?.answer}
            onAnswered={(r) => handleAnswered("section1", section1.index, r)}
          />
        )}
        <div className="mock-nav">
          <button
            type="button"
            disabled={section1.index === 0}
            onClick={() => goTo("section1", section1.index - 1)}
          >
            &larr; Previous
          </button>
          <button
            type="button"
            disabled={section1.index + 1 >= section1.questions.length}
            onClick={() => goTo("section1", section1.index + 1)}
          >
            Skip / Next &rarr;
          </button>
          <button type="button" onClick={attemptFinishSection1}>
            Finish Section 1 &rarr;
          </button>
        </div>
      </div>
    );
  }

  if (phase === "section2" && section2) {
    const question = section2.questions[section2.index];
    const attempt = section2.attempts[section2.index];
    return (
      <div className="skill-page">
        <h1>Mock Test — Section 2 ({tier})</h1>
        <p>
          Question {section2.index + 1} of {section2.questions.length} — time
          remaining: {section2Timer.label}
        </p>
        <div className="mock-toolbar">
          {calculatorToggle}
          {timerToggle}
        </div>
        {showCalculator && <Calculator />}
        {renderPalette(section2, (i) => goTo("section2", i))}
        {question ? (
          <QuestionView
            key={question.id}
            question={question}
            deferFeedback
            showTimer={showTimer}
            initialAnswer={attempt?.answer}
            onAnswered={(r) => handleAnswered("section2", section2.index, r)}
          />
        ) : (
          <p>Not enough questions available yet for this difficulty tier.</p>
        )}
        <div className="mock-nav">
          <button
            type="button"
            disabled={section2.index === 0}
            onClick={() => goTo("section2", section2.index - 1)}
          >
            &larr; Previous
          </button>
          <button
            type="button"
            disabled={section2.index + 1 >= section2.questions.length}
            onClick={() => goTo("section2", section2.index + 1)}
          >
            Skip / Next &rarr;
          </button>
          <button type="button" onClick={attemptFinishSection2}>
            Finish test &rarr;
          </button>
        </div>
      </div>
    );
  }

  if (phase === "review" && completedResult) {
    const totalCorrect =
      countCorrect(completedResult.section1) + countCorrect(completedResult.section2);
    const totalQuestions =
      completedResult.section1.questions.length + completedResult.section2.questions.length;
    return (
      <div className="skill-page">
        <Link to="/">&larr; Back to skill list</Link>
        <h1>Mock Test — Review</h1>
        <p>{new Date(completedResult.date).toLocaleString()}</p>
        <p>
          Section 1: {countCorrect(completedResult.section1)}/
          {completedResult.section1.questions.length} correct.
        </p>
        <p>
          Section 2 ({completedResult.section2.tier}):{" "}
          {countCorrect(completedResult.section2)}/{completedResult.section2.questions.length}{" "}
          correct.
        </p>
        <p>
          Total: {totalCorrect}/{totalQuestions} correct.
        </p>
        <p>
          <strong>Estimated score: {completedResult.estimatedScore} / 170</strong>
        </p>
        <p className="hint">
          This is a rough estimate from the current pool, not ETS's official
          concordance table — treat it as directional until dedicated,
          difficulty-calibrated mock content is built out.
        </p>
        <div className="mock-review-actions">
          <button type="button" onClick={() => setPhase("landing")}>
            Back to Mock Test home
          </button>
        </div>
        <h2>Section 1 review</h2>
        {completedResult.section1.questions.map((qa, i) => {
          const question = getQuestionById(qa.questionId);
          return question ? (
            <QuestionReviewCard key={qa.questionId} question={question} attempt={qa} index={i} />
          ) : null;
        })}
        <h2>Section 2 review</h2>
        {completedResult.section2.questions.map((qa, i) => {
          const question = getQuestionById(qa.questionId);
          return question ? (
            <QuestionReviewCard key={qa.questionId} question={question} attempt={qa} index={i} />
          ) : null;
        })}
      </div>
    );
  }

  return null;
}
