import { useState } from "react";

export function NumericInput({
  onSubmit,
  initialAnswer,
}: {
  onSubmit: (answer: number) => void;
  initialAnswer?: number;
}) {
  const [value, setValue] = useState(initialAnswer !== undefined ? String(initialAnswer) : "");
  const parsed = Number(value);
  const isValid = value.trim() !== "" && !Number.isNaN(parsed);

  return (
    <div className="numeric-input">
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Enter your answer"
      />
      <button type="button" disabled={!isValid} onClick={() => onSubmit(parsed)}>
        Submit
      </button>
    </div>
  );
}
