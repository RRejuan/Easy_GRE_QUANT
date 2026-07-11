import { useState } from "react";
import type { QCQuestion } from "../../types";
import { MathText } from "../MathText";

const QC_CHOICES: { id: "A" | "B" | "C" | "D"; label: string }[] = [
  { id: "A", label: "Quantity A is greater" },
  { id: "B", label: "Quantity B is greater" },
  { id: "C", label: "The two quantities are equal" },
  { id: "D", label: "The relationship cannot be determined from the information given" },
];

export function QCInput({
  question,
  onSubmit,
}: {
  question: QCQuestion;
  onSubmit: (answer: "A" | "B" | "C" | "D") => void;
}) {
  const [selected, setSelected] = useState<"A" | "B" | "C" | "D">();

  return (
    <div className="qc-input">
      <div className="qc-quantities">
        <div>
          <strong>Quantity A</strong>
          <div><MathText text={question.quantityA} /></div>
        </div>
        <div>
          <strong>Quantity B</strong>
          <div><MathText text={question.quantityB} /></div>
        </div>
      </div>
      <fieldset>
        {QC_CHOICES.map((choice) => (
          <label key={choice.id}>
            <input
              type="radio"
              name={`qc-${question.id}`}
              checked={selected === choice.id}
              onChange={() => setSelected(choice.id)}
            />
            {choice.label}
          </label>
        ))}
      </fieldset>
      <button type="button" disabled={!selected} onClick={() => selected && onSubmit(selected)}>
        Submit
      </button>
    </div>
  );
}
