import type { Lesson } from "../types";
import { MathText } from "./MathText";

/** The short, up-front definition: summary + formulas, shown before practice starts. */
export function LessonDefinition({ lesson }: { lesson: Lesson }) {
  return (
    <div className="lesson">
      <p className="lesson-summary">
        <MathText text={lesson.summary} />
      </p>
      <ul className="lesson-formulas">
        {lesson.formulas.map((formula) => (
          <li key={formula.name}>
            <strong>{formula.name}:</strong>{" "}
            <MathText text={`\\(${formula.expression}\\)`} />
            {formula.notes && (
              <div className="formula-notes">
                <MathText text={formula.notes} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The fuller how-to-apply write-up (with tricks), revealed on demand during practice. */
export function LessonExplanation({ lesson }: { lesson: Lesson }) {
  return (
    <p className="lesson-explanation">
      <MathText text={lesson.explanation} />
    </p>
  );
}
