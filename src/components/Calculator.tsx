import { useState } from "react";

type Operator = "+" | "-" | "×" | "÷";

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [pending, setPending] = useState<{ value: number; op: Operator } | null>(null);
  const [memory, setMemory] = useState(0);
  const [justEvaluated, setJustEvaluated] = useState(false);

  function inputDigit(digit: string) {
    if (justEvaluated) {
      setDisplay(digit);
      setJustEvaluated(false);
      return;
    }
    setDisplay((d) => (d === "0" ? digit : d + digit));
  }

  function inputDecimal() {
    if (justEvaluated) {
      setDisplay("0.");
      setJustEvaluated(false);
      return;
    }
    setDisplay((d) => (d.includes(".") ? d : d + "."));
  }

  function applyOperator(op: Operator) {
    const value = Number(display);
    const result = pending ? compute(pending.value, value, pending.op) : value;
    setDisplay(String(result));
    setPending({ value: result, op });
    setJustEvaluated(true);
  }

  function compute(a: number, b: number, op: Operator): number {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        return b === 0 ? NaN : a / b;
    }
  }

  function handleEquals() {
    if (!pending) return;
    const value = Number(display);
    const result = compute(pending.value, value, pending.op);
    setDisplay(String(result));
    setPending(null);
    setJustEvaluated(true);
  }

  function handleClear() {
    setDisplay("0");
    setPending(null);
    setJustEvaluated(false);
  }

  function handleSqrt() {
    const value = Number(display);
    setDisplay(String(Math.sqrt(value)));
    setJustEvaluated(true);
  }

  function handleSign() {
    setDisplay((d) => String(-Number(d || "0")));
  }

  return (
    <div className="calculator">
      <div className="calculator-display">{display || "0"}</div>
      <div className="calculator-grid">
        <button type="button" onClick={() => setMemory(0)}>MC</button>
        <button type="button" onClick={() => setDisplay(String(memory))}>MR</button>
        <button type="button" onClick={() => setMemory((m) => m + Number(display || "0"))}>M+</button>
        <button type="button" onClick={() => setMemory((m) => m - Number(display || "0"))}>M-</button>

        <button type="button" onClick={handleClear}>C</button>
        <button type="button" onClick={handleSign}>&plusmn;</button>
        <button type="button" onClick={handleSqrt}>&radic;</button>
        <button type="button" onClick={() => applyOperator("÷")}>&divide;</button>

        <button type="button" onClick={() => inputDigit("7")}>7</button>
        <button type="button" onClick={() => inputDigit("8")}>8</button>
        <button type="button" onClick={() => inputDigit("9")}>9</button>
        <button type="button" onClick={() => applyOperator("×")}>&times;</button>

        <button type="button" onClick={() => inputDigit("4")}>4</button>
        <button type="button" onClick={() => inputDigit("5")}>5</button>
        <button type="button" onClick={() => inputDigit("6")}>6</button>
        <button type="button" onClick={() => applyOperator("-")}>-</button>

        <button type="button" onClick={() => inputDigit("1")}>1</button>
        <button type="button" onClick={() => inputDigit("2")}>2</button>
        <button type="button" onClick={() => inputDigit("3")}>3</button>
        <button type="button" onClick={() => applyOperator("+")}>+</button>

        <button type="button" onClick={() => inputDigit("0")}>0</button>
        <button type="button" onClick={inputDecimal}>.</button>
        <button type="button" className="calculator-equals" onClick={handleEquals}>
          =
        </button>
      </div>
    </div>
  );
}
