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

Use Vitest with `describe`, `it`, and `expect`. Name test files `*.test.ts` or `*.test.tsx` and co-locate them with the implementation. Cover URL normalization, restricted browser pages, missing metadata, and other boundary cases when changing extraction logic. No numeric coverage threshold is configured; add focused regression tests for every behavior change.

## Commit & Pull Request Guidelines

Follow Conventional Commits used in history and enforced by commitlint, for example `feat: add LinkedIn preview` or `fix: resolve relative image URLs`. Keep commits scoped and imperative. Pull requests should explain the user-visible change, link relevant issues, note manual Chrome/Firefox verification, and include screenshots for popup or social-card UI changes. Preserve the minimal `activeTab` and `scripting` permissions unless a permission change is explicitly justified.
