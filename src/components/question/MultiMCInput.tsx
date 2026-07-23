import { useState } from "react";
import type { MultiMCQuestion } from "../../types";
import { MathText } from "../MathText";

export function MultiMCInput({
  question,
  onSubmit,
  initialAnswer,
  autoRecord = false,
}: {
  question: MultiMCQuestion;
  onSubmit: (answer: string[]) => void;
  initialAnswer?: string[];
  autoRecord?: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialAnswer ?? []));

  function toggle(optionId: string) {
    const next = new Set(selected);
    if (next.has(optionId)) next.delete(optionId);
    else next.add(optionId);
    setSelected(next);
    // Record outside the state updater to avoid calling the parent's setState
    // during render.
    if (autoRecord) onSubmit([...next]);
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
      {!autoRecord && (
        <button
          type="button"
          disabled={selected.size === 0}
          onClick={() => onSubmit([...selected])}
        >
          Submit
        </button>
      )}
    </div>
  );
}
