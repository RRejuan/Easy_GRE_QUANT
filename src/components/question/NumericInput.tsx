import { useState } from "react";

export function NumericInput({
  onSubmit,
}: {
  onSubmit: (answer: number) => void;
}) {
  const [value, setValue] = useState("");
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
