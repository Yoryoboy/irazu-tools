# Repository Guidelines

## Project Structure & Module Organization
- App code lives in `src/`:
  - `components/` reusable UI (e.g., `src/components/FileUploader.tsx`, `src/components/ui/*`).
  - `pages/` route-level views (e.g., `src/pages/VendorProduction/VendorProduction.tsx`).
  - `hooks/` stateful logic (`use*` files), `utils/` helpers and API clients (`clickUpApi.ts`, `MQMSApi.ts`).
  - `types/` shared TS types, `constants/` static data, `assets/` and `public/` for static files.
- Use the `@` alias for imports (see `vite.config.ts`). Example: `import { fetchTasks } from '@/utils/clickUpApi'`.
- Reference patterns in `docs/` for API and error-handling approaches.

## Build, Test, and Development Commands
- `pnpm install` install dependencies.
- `pnpm dev` start Vite dev server with HMR.
- `pnpm build` type-check and build to `dist/`.
- `pnpm preview` serve the production build locally.
- `pnpm lint` run ESLint.
- `pnpm test` run Vitest (happy-dom env, Testing Library).

## Coding Style & Naming Conventions
- TypeScript, 2-space indent, single quotes, semicolons, trailing commas (ES5), line width 100 (see `.prettierrc`).
- React components use PascalCase (e.g., `NewTasksTable.tsx`); hooks start with `use*`; utilities and modules use `camelCase`.
- Prefer function components + hooks; colocate small helpers near usage or under `utils/` when shared.

## Testing Guidelines
- Framework: Vitest + React Testing Library (`tests/*.test.tsx|ts`).
- Avoid real network calls; mock HTTP (e.g., axios) and keep tests deterministic.
- Test critical paths: hooks behavior, utilities, and interactive components.
- Run locally via `pnpm test`; for non-watch CI-like run: `pnpm test -- --run`.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat`, `fix`, `chore`, `docs`, `refactor`, `test` with optional scope.
  - Example: `feat(vendor-production): add MILE code columns`.
- PRs include: concise description, linked issues, test plan, and screenshots/GIFs for UI changes.
- Ensure `pnpm lint` and `pnpm test` pass before requesting review.

## Security & Configuration Tips
- Env vars: create `.env` with `VITE_CLICKUP_API_AKEY=...` (Vite exposes `VITE_*`). Do not commit secrets.
- Follow patterns in `docs/async-error-handling-pattern.md` and `docs/clickup-api-pattern.md` when extending API logic.
