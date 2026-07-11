# GRE Quant App

A public self-study web app for GRE Quantitative Reasoning: a fine-grained skill taxonomy, mastery-based practice recommendations, cross-skill composite problems, and full-fidelity adaptive mock tests matching the 2026 (short) GRE format.

See [PLAN.md](./PLAN.md) for the full project plan.

## Stack

React + Vite + TypeScript, KaTeX for math rendering, questions authored as schema-validated JSON.

## Development

```sh
npm install
npm run dev        # start dev server
npm run validate   # validate all question/skill content against schema
npm run lint        # lint
npm run build       # typecheck + production build
```

## Content structure

- `data/skills.json` — skill taxonomy
- `data/questions/<skillId>.json` — one file per skill, questions for that skill
- `data/di-sets.json` — shared Data Interpretation figures/context (optional)
- `schema/*.schema.json` — JSON Schema definitions used by `npm run validate`

Every question batch should be reviewed (raw JSON or a rendered preview) before merging.
