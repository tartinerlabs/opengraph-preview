# Repository Guidelines

## Project Structure & Module Organization

This is a WXT browser extension built with React and TypeScript. Extension code lives in `entrypoints/popup/`: `main.tsx` mounts the popup, `app.tsx` coordinates UI states, and feature components, hooks, styles, and Open Graph extraction utilities sit alongside it. Keep tests next to the code they cover, as in `extract-open-graph.test.ts`.

Static extension icons are under `public/icons/`. Finished Chrome Web Store artwork lives in `marketing/`; it is image assets only, with no build step. WXT generates `.wxt/` and `.output/`, so neither directory should be edited or committed. Root configuration includes `wxt.config.ts`, `tsconfig.json`, and `biome.json`.

## Build, Test, and Development Commands

- `pnpm install` installs exact dependencies and prepares WXT types.
- `pnpm dev` runs the Chrome development build; load `.output/chrome-mv3-dev` as an unpacked extension.
- `pnpm dev:firefox` starts the Firefox variant.
- `pnpm check` runs Biome lint and formatting checks.
- `pnpm test` runs the Vitest suite once.
- `pnpm compile` type-checks without emitting files.
- `pnpm build` creates the production Chrome bundle. Use `pnpm build:firefox` for Firefox and `pnpm zip` or `pnpm zip:firefox` for distributable archives.

Before opening a pull request, run `pnpm check`, `pnpm test`, `pnpm compile`, and `pnpm build`; CI requires all four.

Chrome Web Store releases run from `.github/workflows/release.yml` after CI succeeds on `main`. semantic-release versions from conventional commits (`feat:` minor, `fix:` patch, `BREAKING CHANGE` major), then zips Chrome and runs `wxt submit`. Do not push version tags by hand. Firefox is not submitted.

Set GitHub Actions variables `CHROME_EXTENSION_ID` and `CHROME_PUBLISHER_ID`, and secrets `CHROME_SERVICE_ACCOUNT_CLIENT_EMAIL`, `CHROME_SERVICE_ACCOUNT_PRIVATE_KEY`, plus the existing `HEROUI_AUTH_TOKEN`. Use Chrome Web Store API v2: create a Google Cloud service account, enable the Chrome Web Store API, and add the service account email under Account in the Developer Dashboard. Publisher ID is the path segment in `https://chrome.google.com/webstore/devconsole/{publisherId}`. Do not commit `.env.submit`.

## Coding Style & Naming Conventions

Biome is authoritative: use two-space indentation, double quotes, and organized imports. Prefer small typed functions and React function components. Name component files in kebab case (`preview-image.tsx`), components and types in PascalCase, hooks with a `use` prefix, and other functions in camelCase. Keep `readOpenGraphFromDocument` self-contained because the browser serializes it for script injection.

## Testing Guidelines

Use Vitest with `describe`, `it`, and `expect`. Name test files `*.test.ts` or `*.test.tsx` and co-locate them with the implementation. Unit tests belong on the pure helpers in `extract-open-graph.ts` and `evaluate-checks.ts` (URL normalization, restricted pages, missing metadata, check messages). There is no coverage threshold. Do not require component tests for platform preview cards or popup chrome; those are reviewed visually.

## Commit & Pull Request Guidelines

Follow Conventional Commits used in history and enforced by commitlint, for example `feat: add LinkedIn preview` or `fix: resolve relative image URLs`. Keep commits scoped and imperative. Pull requests should explain the user-visible change, link relevant issues, note manual Chrome/Firefox verification, and include screenshots for popup or social-card UI changes. Preserve the minimal `activeTab` and `scripting` permissions unless a permission change is explicitly justified.

## Code Review Rules

Codex: post only findings that would ship a wrong card, drop tags, leak data, or expand permissions. Skip everything else. Prefer a 👍 with no comments over a wall of P2s.

### Do not report

- Formatting, imports, naming taste, comment density, extra abstractions, or anything Biome/`pnpm check` already covers.
- Unused helpers, types, or missing UI on a stacked PR. Later PRs in the same stack are allowed to wire them up.
- Missing tests for `platform-previews.tsx`, `preview-tabs.tsx`, or other React chrome. Tests are for extract/check helpers only.
- Horizontal scrolling of the tab strip at 420px. That layout is intentional.
- Hardcoded third-party colours, type, or crops inside platform cards. Fidelity beats taste; HeroUI tokens must not leak into those cards.
- Discord using `og:image` only (no `twitter:image` fallback). That matches Discord.
- Hypothetical timeouts, 403/405 HEAD bodies, mid-load layout shifts, or other speculative edge cases unless they already break the common path.
- Scope expansions: more platforms, host permissions, content scripts, cache busting, or “while you’re here” refactors.

### Do report

- New permissions beyond `activeTab` and `scripting`, or a content script, without an explicit justification.
- `readOpenGraphFromDocument` importing or closing over bindings (Chrome cannot inject it).
- A platform preview that would make a ship/no-ship decision using the wrong tags or the wrong card variant on the common path.
- Secrets or credentials in the diff.
