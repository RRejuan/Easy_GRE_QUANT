import type { Lesson } from "../types";
import { MathText } from "./MathText";

export function LessonView({ lesson }: { lesson: Lesson }) {
  return (
    <div className="lesson">
      <p className="lesson-summary">
        <MathText text={lesson.summary} />
      </p>
      <ul className="lesson-formulas">
        {lesson.formulas.map((formula) => (
          <li key={formula.name}>
            <strong>{formula.name}:</strong> <MathText text={`$${formula.expression}$`} />
            {formula.notes && (
              <div className="formula-notes">
                <MathText text={formula.notes} />
              </div>
            )}
          </li>
        ))}
      </ul>
      <p className="lesson-explanation">
        <MathText text={lesson.explanation} />
      </p>
    </div>
  );
}
