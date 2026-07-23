import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { allVocabWords } from "../lib/vocab";
import { loadVocabSrs } from "../lib/storage/vocab";
import { isDue } from "../lib/srs";
import { VocabQuiz } from "../components/vocab/VocabQuiz";

export function VocabReviewPage() {
  const [done, setDone] = useState(false);
  // Snapshot the due set once so answering (which reschedules words) doesn't
  // reshuffle the queue mid-session.
  const dueIds = useMemo(() => {
    const srs = loadVocabSrs();
    const now = Date.now();
    return allVocabWords()
      .filter((w) => isDue(srs[w.id], now))
      .map((w) => w.id);
  }, []);

  return (
    <div className="skill-page vocab-review-page">
      <Link to="/vocab">&larr; Back to vocabulary</Link>
      <h1>Review</h1>

      {dueIds.length === 0 ? (
        <p>
          No words are due for review right now. Learn a lesson, or come back
          after a day or two once your known words start to fade.
        </p>
      ) : done ? (
        <>
          <p className="result-correct">Review complete — nicely done.</p>
          <Link to="/vocab" className="cta-button">
            Back to vocabulary
          </Link>
        </>
      ) : (
        <VocabQuiz wordIds={dueIds} mode="review" onDone={() => setDone(true)} />
      )}
    </div>
  );
}
