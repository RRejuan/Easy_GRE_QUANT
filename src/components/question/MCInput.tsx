import { useState } from "react";
import type { MCQuestion } from "../../types";
import { MathText } from "../MathText";

export function MCInput({
  question,
  onSubmit,
}: {
  question: MCQuestion;
  onSubmit: (answer: string) => void;
}) {
  const [selected, setSelected] = useState<string>();

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
