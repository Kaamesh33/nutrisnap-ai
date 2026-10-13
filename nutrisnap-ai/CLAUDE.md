# Notes for future AI-assisted sessions

Paste this file (and any error output) at the start of a new session.

## Project

NutriSnap AI: React 18 + TypeScript (strict) + Vite 6 single-page app, hosted on GitHub Pages via `.github/workflows/deploy.yml`. Tests: Vitest 4 + Testing Library + jsdom. No runtime dependencies besides React. Node 24 LTS recommended (npm 11); `npm ci` also works with npm 10.

## Rules

- Nutrition numbers come only from deterministic code in `src/utils/nutrition.ts` and the per-100 g food list. Never let an AI model produce calories or macros.
- Never present demo or sample data as real analysis. Every item carries `source`: reference, user, ai-estimate or demo; meals carry `origin`.
- Never put secrets in the frontend. `VITE_ANALYSIS_API_URL` is a public URL of the person's own backend; keys stay in that backend.
- Dates are local `YYYY-MM-DD` strings (`src/utils/dates.ts`); never use `toISOString()` for day keys.
- Routing is hash-based (`#/page`) with `base: './'`, so the repository name does not matter.
- Storage key `nutrisnap-ai:data:v1` in localStorage; `src/services/storage.ts` validates on load. If the data shape changes, bump the version and write a migration.
- Keep it beginner-maintainable: no state library, no router library, no chart library, no CSS framework.
- Run `npm test` and `npm run build` after every change. Do not claim checks passed unless they were run.

## Map

- `src/data/foods.ts` food list (approximate; see `docs/FOOD_DATA.md`)
- `src/services/` food search, storage, photo analysis (AI off by default), rule-based coach
- `src/hooks/useAppStore.tsx` app state and persistence; `useHashRoute.ts` router
- `src/components/MealEditor.tsx` shared editor for new and edited meals
- `src/pages/` one file per screen
- `src/styles/global.css` design tokens at the top (deep green, macro colours, fonts)

## Known gaps and next tasks

1. Verify food values against IFCT 2017 / USDA and update `basis` notes.
2. Resize photos in the browser before any future AI upload.
3. Build and test the optional backend in `docs/AI_BACKEND_PLAN.md`.
4. Optional: save small photo thumbnails (watch the ~5 MB localStorage limit; IndexedDB would be better).
5. Optional: PWA install support and offline caching.
