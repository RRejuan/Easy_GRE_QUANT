import { useState } from "react";
import type { MultiMCQuestion } from "../../types";
import { MathText } from "../MathText";

export function MultiMCInput({
  question,
  onSubmit,
}: {
  question: MultiMCQuestion;
  onSubmit: (answer: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(optionId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) next.delete(optionId);
      else next.add(optionId);
      return next;
    });
  }

  return (
    <div className="multimc-input">
      <fieldset>
        {question.options.map((option) => (
          <label key={option.id}>
            <input
              type="checkbox"
              checked={selected.has(option.id)}
              onChange={() => toggle(option.id)}
            />
            <MathText text={option.text} />
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        disabled={selected.size === 0}
        onClick={() => onSubmit([...selected])}
      >
        Submit
      </button>
    </div>
  );
}
