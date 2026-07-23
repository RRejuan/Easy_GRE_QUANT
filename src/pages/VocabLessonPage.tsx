import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getVocabLesson } from "../lib/vocab";
import { loadVocabSrs } from "../lib/storage/vocab";
import { deriveState } from "../lib/srs";
import { WordCard } from "../components/vocab/WordCard";
import { VocabStory } from "../components/vocab/VocabStory";
import { VocabQuiz } from "../components/vocab/VocabQuiz";

export function VocabLessonPage() {
  const { lessonId = "" } = useParams();
  const lesson = getVocabLesson(lessonId);
  const [mode, setMode] = useState<"study" | "quiz">("study");
  // Bumped after a quiz so the study view re-reads each word's review state.
  const [, setVersion] = useState(0);

  if (!lesson) {
    return (
      <div className="skill-page">
        <p>Lesson not found.</p>
        <Link to="/vocab">Back to vocabulary</Link>
      </div>
    );
  }

  const srs = loadVocabSrs();
  const now = Date.now();
  const toLearn = lesson.words
    .filter((w) => deriveState(srs[w.id], now) !== "known")
    .map((w) => w.id);

  return (
    <div className="skill-page vocab-lesson-page">
      <Link to="/vocab">&larr; Back to vocabulary</Link>
      <h1>{lesson.title}</h1>

      {mode === "quiz" ? (
        <VocabQuiz
          wordIds={toLearn}
          mode="learn"
          onDone={() => {
            setMode("study");
            setVersion((v) => v + 1);
          }}
        />
      ) : (
        <>
          <p className="vocab-lesson-hint">
            Read the story first and try to work out each highlighted word from
            context. Then check the meanings below to fill in the gaps — and
            quiz yourself when you're ready.
          </p>

          <h2>Story</h2>
          <p className="vocab-story-hint">
            Tap a highlighted word to reveal its meaning.
          </p>
          <VocabStory story={lesson.story} words={lesson.words} />

          <h2>Meanings</h2>
          <ul className="vocab-word-list">
            {lesson.words.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                state={deriveState(srs[word.id], now)}
              />
            ))}
          </ul>

          {toLearn.length > 0 ? (
            <button
              type="button"
              className="cta-button"
              onClick={() => setMode("quiz")}
            >
              Quiz {toLearn.length} word{toLearn.length === 1 ? "" : "s"} to learn
            </button>
          ) : (
            <p className="vocab-due-none">
              You've learned every word in this lesson. They'll return for review
              when they're due.
            </p>
          )}
        </>
      )}
    </div>
  );
}
