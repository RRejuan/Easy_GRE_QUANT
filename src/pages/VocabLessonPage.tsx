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

  return (
    <div className="skill-page vocab-lesson-page">
      <Link to="/vocab">&larr; Back to vocabulary</Link>
      <h1>{lesson.title}</h1>

      {mode === "quiz" ? (
        <VocabQuiz
          wordIds={lesson.words.map((w) => w.id)}
          onDone={() => {
            setMode("study");
            setVersion((v) => v + 1);
          }}
        />
      ) : (
        <>
          <p className="vocab-lesson-hint">
            Study the {lesson.words.length} words and the story, then quiz
            yourself. Correct answers schedule each word for spaced review.
          </p>
          <button
            type="button"
            className="cta-button"
            onClick={() => setMode("quiz")}
          >
            Quiz these {lesson.words.length} words
          </button>

          <ul className="vocab-word-list">
            {lesson.words.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                state={deriveState(srs[word.id], now)}
              />
            ))}
          </ul>

          <h2>Story</h2>
          <p className="vocab-story-hint">
            Every word from this lesson appears below. Tap a highlighted word to
            see its meaning.
          </p>
          <VocabStory story={lesson.story} words={lesson.words} />
        </>
      )}
    </div>
  );
}
