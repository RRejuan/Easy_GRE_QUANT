import { useState } from "react";
import type { MCQuestion } from "../../types";
import { MathText } from "../MathText";

export function MCInput({
  question,
  onSubmit,
  initialAnswer,
  autoRecord = false,
}: {
  question: MCQuestion;
  onSubmit: (answer: string) => void;
  initialAnswer?: string;
  /** In mock mode, record the answer the moment a choice is selected and hide
   * the Submit button (there is no per-question submit on the real test). */
  autoRecord?: boolean;
}) {
  const [selected, setSelected] = useState<string | undefined>(initialAnswer);

  function choose(optionId: string) {
    setSelected(optionId);
    if (autoRecord) onSubmit(optionId);
  }

  return (
    <div className="mc-input">
      <fieldset>
        {question.options.map((option) => (
          <label key={option.id}>
            <input
              type="radio"
              name={`mc-${question.id}`}
              checked={selected === option.id}
              onChange={() => choose(option.id)}
            />
            <MathText text={option.text} />
          </label>
        ))}
      </fieldset>
      {!autoRecord && (
        <button type="button" disabled={!selected} onClick={() => selected && onSubmit(selected)}>
          Submit
        </button>
      )}
    </div>
  );
}
