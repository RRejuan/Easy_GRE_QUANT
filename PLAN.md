# GRE Quant App — Project Plan

Working title: TBD (see name options in README discussion). Owner: Rifat (math PhD, content reviewer). Builder: Claude.

## Vision

A public self-study web app for GRE Quantitative Reasoning, more systematic than Magoosh: a fine-grained skill taxonomy, mastery-based practice recommendations, cross-skill composite problems, and full-fidelity adaptive mock tests matching the 2026 (short) GRE format. Where a real shortcut exists (backsolving from options, plugging in numbers, elimination, number sense), questions ship a second "shortcut" solution alongside the standard one.

## GRE 2026 facts the app must match

- Quant = 2 sections: 12 questions / 21 min, then 15 questions / 26 min
- Section-level adaptive: Section 1 performance sets Section 2 difficulty (easy/medium/hard pool)
- Score scale 130–170; ~170 requires hard second section and ≤1 miss
- Question types: Quantitative Comparison, single-answer MC, multi-answer MC ("select all"), Numeric Entry, Data Interpretation sets (3 q on shared figure)
- Content areas: Arithmetic, Algebra, Geometry, Data Analysis
- On-screen 4-function calculator (with √ and memory) available in mocks

## Decisions from interview

| Decision | Choice |
|---|---|
| Audience | Public self-study tool |
| Stack | Claude decides (see Architecture) |
| Content authoring | Claude drafts in ETS style; Rifat reviews/edits every item |
| Shortcut pedagogy | Shortcut solution shown when a genuine shortcut exists |
| Skill taxonomy | ~40–60 fine skills under 4 areas → ~15 topics |
| Adaptivity | Mastery score per skill (accuracy + speed + difficulty); recommendation engine; prerequisite-gated cross-skill problems |
| Mock tests | 3–5 full-fidelity quant mocks with section-adaptive logic + score estimate |
| Pool size v1 | ~500 questions (~10/skill) |
| Diagnostic | Yes — ~20–25 q adaptive diagnostic seeds the mastery map |
| Git | Local repo → push to GitHub (user has gh credentials) |

## Architecture

- **React + Vite SPA**, TypeScript. No backend in v1.
- **KaTeX** for math rendering.
- **Questions as JSON** files (one file per skill) validated by a schema — easy for Rifat to review as plain text diffs in git.
- **Progress in localStorage** behind a `StorageAdapter` interface, so v2 can swap in Supabase/Firebase for accounts + cross-device sync without touching app logic.
- **Deploy**: GitHub Pages (or Vercel) — free, automatic from the repo.

## Data model (core)

- `Skill`: id, area, topic, name, prerequisites[], description
- `Question`: id, type (QC | MC | MultiMC | Numeric | DI-set member), primarySkill, secondarySkills[], difficulty (1–5), stem (LaTeX), options, answer, solutionStandard, solutionShortcut?, shortcutTags[] (backsolve, plug-in, estimate, eliminate), timeTargetSec
- `MasteryState` per skill: rolling accuracy, avg time vs target, highest difficulty cleared → mastery 0–100
- `MockTest`: fixed Section 1 + three Section 2 variants (easy/med/hard) + score-lookup table

## Phases

**Phase 0 — Repo + skeleton (first work session)**
Git init, GitHub repo, Vite+React+TS scaffold, question schema + validator, CI check that all questions pass schema. Deliverable: running empty app, pushed.

**Phase 1 — Skill taxonomy + seed content**
Define the full ~50-skill taxonomy with prerequisites (Rifat approves before content starts). Draft 2 sample skills' question sets (~20 q) end-to-end to lock format/quality bar.

**Phase 2 — Practice engine**
Question player for all 5 formats, timer, solution reveal (standard + shortcut), per-skill drill mode, mastery scoring, localStorage persistence.

**Phase 3 — Question pool build-out**
~500 questions in review batches (one topic at a time → Rifat reviews git diff → merge). Cross-skill composite problems gated on prerequisites.

**Phase 4 — Diagnostic + recommendations**
20–25 q adaptive diagnostic seeding mastery map; "what to study next" engine; dashboard: overall progress + per-topic/per-skill progress views.

**Phase 5 — Mock tests**
3–5 mocks, exact 2026 timing/adaptive rules, on-screen calculator clone, 130–170 score estimate, post-test skill-level review report.

**Phase 6 — Polish + launch**
Design pass, mobile layout, deploy to GitHub Pages, README, seed feedback loop.

## Review workflow (content quality)

Every question batch = one git branch/commit. Rifat reviews raw JSON or a rendered review page, flags edits, Claude fixes, merge. No question reaches the pool unreviewed.

## Name candidates

QuantForge, SkillSharp GRE, Quant170, MasteryGRE, GRE QuantLab, Perch (170 = perfect perch). Repo can start as `gre-quant-app` and rename anytime.
