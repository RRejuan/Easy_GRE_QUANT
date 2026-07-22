import { Link } from "react-router-dom";
import { allVocabWords, listVocabLessons } from "../lib/vocab";
import { loadVocabSrs } from "../lib/storage/vocab";
import { deriveState, isDue } from "../lib/srs";

export function VocabPage() {
  const lessons = listVocabLessons();
  const srs = loadVocabSrs();
  const now = Date.now();
  const dueCount = allVocabWords().filter((w) => isDue(srs[w.id], now)).length;

  return (
    <div className="skill-page vocab-page">
      <h1>Vocabulary</h1>
      <p className="vocab-intro">
        Learn high-frequency GRE words in short themed lessons, then review them
        on a spaced schedule so they actually stick. Words turn{" "}
        <span className="vocab-swatch vocab-state-known">green</span> when you
        know them and{" "}
        <span className="vocab-swatch vocab-state-due">yellow</span> when it's
        time to refresh them.
      </p>

      {dueCount > 0 ? (
        <Link to="/vocab/review" className="cta-button">
          Review {dueCount} due word{dueCount === 1 ? "" : "s"}
        </Link>
      ) : (
        <p className="vocab-due-none">
          Nothing due for review right now — check back in a day or two.
        </p>
      )}

      <ul className="vocab-lesson-list">
        {lessons.map((lesson) => {
          let known = 0;
          let due = 0;
          let fresh = 0;
          for (const w of lesson.words) {
            const state = deriveState(srs[w.id], now);
            if (state === "known") known++;
            else if (state === "new") fresh++;
            else due++;
          }
          return (
            <li key={lesson.id}>
              <Link to={`/vocab/${lesson.id}`} className="vocab-lesson-card">
                <span className="vocab-lesson-title">{lesson.title}</span>
                <span className="vocab-lesson-counts">
                  <span className="vocab-chip vocab-state-known">
                    {known} known
                  </span>
                  <span className="vocab-chip vocab-state-due">
                    {due} to review
                  </span>
                  <span className="vocab-chip vocab-state-new">{fresh} new</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
