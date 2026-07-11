import type { VariableSpec } from "../types";

export function resolveVariables(specs?: VariableSpec[]): Record<string, number> {
  const values: Record<string, number> = {};
  for (const spec of specs ?? []) {
    const step = spec.step ?? 1;
    const stepsCount = Math.floor((spec.max - spec.min) / step) + 1;
    const randomStep = Math.floor(Math.random() * stepsCount);
    values[spec.name] = spec.min + randomStep * step;
  }
  return values;
}

function evalExpr(expr: string, values: Record<string, number>): number {
  const names = Object.keys(values);
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const fn = new Function(...names, `"use strict"; return (${expr});`);
  return fn(...names.map((n) => values[n]));
}

/**
 * Replaces {{expr}} placeholders (JS expressions over the resolved variables)
 * with a green-highlighted value. Tracks whether each placeholder falls
 * inside an already-open \(...\) math span (math mode can't be re-entered
 * from within itself, so nesting a self-contained \(\color{...}\) there
 * would be invalid LaTeX) and only self-wraps in \( \) when in plain text.
 */
export function fillTemplate(text: string, values: Record<string, number>): string {
  if (Object.keys(values).length === 0) return text;

  let result = "";
  let lastIndex = 0;
  let inMath = false;
  const tokenRegex = /\\\(|\\\)|\{\{([^}]+)\}\}/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    result += text.slice(lastIndex, match.index);
    lastIndex = tokenRegex.lastIndex;

    if (match[0] === "\\(") {
      inMath = true;
      result += match[0];
    } else if (match[0] === "\\)") {
      inMath = false;
      result += match[0];
    } else {
      try {
        const value = evalExpr(match[1].trim(), values);
        result += inMath ? `\\color{green}{${value}}` : `\\(\\color{green}{${value}}\\)`;
      } catch {
        result += match[0];
      }
    }
  }
  result += text.slice(lastIndex);
  return result;
}

export function evalFormula(formula: string, values: Record<string, number>): number {
  return evalExpr(formula, values);
}
