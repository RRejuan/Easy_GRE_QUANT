import { useState } from "react";

export function NumericInput({
  onSubmit,
  initialAnswer,
  autoRecord = false,
}: {
  onSubmit: (answer: number) => void;
  initialAnswer?: number;
  autoRecord?: boolean;
}) {
  const [value, setValue] = useState(initialAnswer !== undefined ? String(initialAnswer) : "");
  const parsed = Number(value);
  const isValid = value.trim() !== "" && !Number.isNaN(parsed);

  function handleChange(next: string) {
    setValue(next);
    if (autoRecord) {
      const p = Number(next);
      if (next.trim() !== "" && !Number.isNaN(p)) onSubmit(p);
    }
  }

  return (
    <div className="numeric-input">
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Enter your answer"
      />
      {!autoRecord && (
        <button type="button" disabled={!isValid} onClick={() => onSubmit(parsed)}>
          Submit
        </button>
      )}
    </div>
  );
}
