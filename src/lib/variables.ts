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

/** Replaces {{expr}} placeholders (JS expressions over the resolved variables) with a green-highlighted inline-math value. */
export function fillTemplate(text: string, values: Record<string, number>): string {
  if (Object.keys(values).length === 0) return text;
  return text.replace(/\{\{([^}]+)\}\}/g, (whole, expr: string) => {
    try {
      const value = evalExpr(expr.trim(), values);
      return `\\(\\color{green}{${value}}\\)`;
    } catch {
      return whole;
    }
  });
}

export function evalFormula(formula: string, values: Record<string, number>): number {
  return evalExpr(formula, values);
}
