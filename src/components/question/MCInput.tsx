import { useState } from "react";
import type { MCQuestion } from "../../types";
import { MathText } from "../MathText";

export function MCInput({
  question,
  onSubmit,
  initialAnswer,
}: {
  question: MCQuestion;
  onSubmit: (answer: string) => void;
  initialAnswer?: string;
}) {
  const [selected, setSelected] = useState<string | undefined>(initialAnswer);

  return (
    <div className="mc-input">
      <fieldset>
        {question.options.map((option) => (
          <label key={option.id}>
            <input
              type="radio"
              name={`mc-${question.id}`}
              checked={selected === option.id}
              onChange={() => setSelected(option.id)}
            />
            <MathText text={option.text} />
          </label>
        ))}
      </fieldset>
      <button type="button" disabled={!selected} onClick={() => selected && onSubmit(selected)}>
        Submit
      </button>
    </div>
  );
}
