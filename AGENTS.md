# Repository Guidelines

## Project Structure & Module Organization

This is a WXT browser extension built with React and TypeScript. Extension code lives in `entrypoints/popup/`: `main.tsx` mounts the popup, `app.tsx` coordinates UI states, and feature components, hooks, styles, and Open Graph extraction utilities sit alongside it. Keep tests next to the code they cover, as in `extract-open-graph.test.ts`.

Static extension icons are under `public/icons/`. Finished Chrome Web Store artwork lives in `marketing/`; it is image assets only, with no build step. WXT generates `.wxt/` and `.output/`, so neither directory should be edited or committed. Root configuration includes `wxt.config.ts`, `tsconfig.json`, and `biome.json`. `vite-icon-subset.ts` is the Vite plugin that bundles the icons named in `ICON_NAMES` so the popup never fetches icons from the network.

## Build, Test, and Development Commands

- `pnpm install` installs exact dependencies and prepares WXT types. `savePrefix` is empty, so dependencies are pinned exactly; add packages without ranges.
- `pnpm dev` runs the Chrome development build; load `.output/chrome-mv3-dev` as an unpacked extension.
- `pnpm dev:firefox` starts the Firefox variant.
- `pnpm check` runs Biome lint and formatting checks; `pnpm format` applies fixes.
- `pnpm test` runs the Vitest suite once. Run one file with `pnpm vitest run entrypoints/popup/extract-open-graph.test.ts`.
- `pnpm compile` type-checks without emitting files.
- `pnpm build` creates the production Chrome bundle. Use `pnpm build:firefox` for Firefox and `pnpm zip` or `pnpm zip:firefox` for distributable archives.

Before opening a pull request, run `pnpm check`, `pnpm test`, `pnpm compile`, and `pnpm build`; CI (`.github/workflows/ci.yml`) requires all four. Husky runs gitleaks and lint-staged on pre-commit and commitlint on commit-msg.

Chrome Web Store releases run from `.github/workflows/release.yml` after CI succeeds on `main`. semantic-release versions from conventional commits (`feat:` minor, `fix:` patch, `BREAKING CHANGE` major), then zips Chrome and runs `wxt submit`. Do not push version tags by hand. Firefox is not submitted; do not add Firefox or Edge submit flags until those listings exist.

Set GitHub Actions variables `CHROME_EXTENSION_ID` and `CHROME_PUBLISHER_ID`, and secrets `CHROME_SERVICE_ACCOUNT_CLIENT_EMAIL`, `CHROME_SERVICE_ACCOUNT_PRIVATE_KEY`, plus the existing `HEROUI_AUTH_TOKEN`. Use Chrome Web Store API v2: create a Google Cloud service account, enable the Chrome Web Store API, and add the service account email under Account in the Developer Dashboard. Publisher ID is the path segment in `https://chrome.google.com/webstore/devconsole/{publisherId}`. Do not commit `.env.submit`.

## Architecture

A WXT + React 19 browser extension with a **single popup entrypoint**: no background script, no content script. Data flow, popup open to render:

1. `use-open-graph-preview.ts` queries the active tab, keeps its URL and title for the header (`describeTab`), rejects it early via `isRestrictedTabUrl`, then calls `browser.scripting.executeScript` with `readOpenGraphFromDocument`.
2. `readOpenGraphFromDocument` (in `extract-open-graph.ts`) runs **in the page**. It must stay self-contained (no imports, no closed-over bindings) because Chrome serializes the function body. Anything it needs must be declared inside it.
3. The extractor returns provenance alongside the preview fields: separate og vs twitter image/title/description, `twitter:card`, `theme-color`, and `crawlerInvisibleTags` (present in the live DOM but missing from the HTML source). The hook resolves `image`, `ogImage`, and `twitterImage` against the tab URL (`resolveOgImageUrl`) so relative Next.js `opengraph-image` paths work on localhost, and exposes a `PreviewState` union: `loading | restricted | error | ready`.
4. `app.tsx` switches on that union and renders `popup-header.tsx` in every state; `preview-tabs.tsx` tracks broken image URLs (one `<img onError>` failure marks that URL broken, not every card), runs `evaluateChecks`, and fans props out to `platform-previews.tsx`. The tab strip (Image, X, Facebook, LinkedIn, Slack, Discord, WhatsApp, Reddit) sits in `Tabs.ListContainer`; each tab's issue dot comes from `check-platforms.ts`. Checks and Raw tags render below the panel on every tab.

`platform-previews.tsx` holds one component per surface (og:image, X, Facebook, LinkedIn, Slack, Discord, WhatsApp, Reddit). These deliberately hardcode each platform's brand colours and card geometry as literal Tailwind values rather than theme tokens; they are pixel imitations of third-party UI, not app chrome. **Discord's left bar is the exception:** it uses the page `theme-color` (falling back to `#202225`) because Discord does. `preview-image.tsx` centralises the missing/broken image empty states. In `preview-tabs.tsx` each card renders inside a light-scoped wrapper (`className="light" data-theme="light"`; Discord's is dark) so cards never invert with the popup's dark mode, and the wrapper caps the card at the platform's approximate width (`widthClassName` in `PLATFORM_TABS`). Change `platform-previews.tsx` only to match a platform, never to restyle.

Permissions are `activeTab` + `scripting` only (`wxt.config.ts`). Do not add host permissions or a content script without a reason; the store listing and `PRIVACY.md` claim no data collection and no persistent page access.

The extractor's pure helpers (`resolveOgImageUrl`, `isRestrictedTabUrl`, `displayHostname`) are deliberately separated from the injected function and from React so they can be tested without a DOM; `evaluate-checks.ts` is a pure function over those tags for the same reason.

## Coding Style & Naming Conventions

Biome is authoritative: use two-space indentation, double quotes, and organized imports. Prefer small typed functions and React function components. Name component files in kebab case (`preview-image.tsx`), components and types in PascalCase, hooks with a `use` prefix, and other functions in camelCase. Keep `readOpenGraphFromDocument` self-contained because the browser serializes it for script injection.

- Relative imports carry explicit extensions (`./app.tsx`, `./extract-open-graph.ts`); `allowImportingTsExtensions` is on.
- UI comes from `@heroui/react` and `@heroui-pro/react` (v3 compound components: `EmptyState.Header`, `Tabs.Panel`). Pro CSS comes from the single documented `@import "@heroui-pro/react/css"` in `style.css`, after `@heroui/styles`; it is already in `@layer components`, so do not import per-component files.
- Build chrome from HeroUI OSS/Pro components first; hand-roll markup only where no component fits (the dotted stage, the header glow).
- Popup width is fixed at 800px (Chrome's popup maximum) in `style.css`; height is capped at 600px by the browser and the popup scrolls past it.
- Dark mode follows the OS: `main.tsx` sets `.dark`/`data-theme` on `<html>`, and `style.css` defines light, first-paint `prefers-color-scheme`, and `.dark` token blocks. Chrome text never goes below 13px; motion has a `prefers-reduced-motion` fallback.
- Icons are bundled offline: add any new icon name to `ICON_NAMES` in `vite-icon-subset.ts`, or `@iconify/react` falls back to fetching it from the network.
- Brand colour is indigo. The popup's HeroUI `--accent` is `#5e4df2` in `style.css`, one step darker than the icon's `#6d5bff` so text and focus rings clear WCAG AA on the popup greys. Icons and `marketing/` artwork use the `#6d5bff` → `#3b2fd9` gradient on a `#0d0a1f` background. Brand colour is for app chrome only; never use it inside platform cards.

## Testing Guidelines

Use Vitest with `describe`, `it`, and `expect`. Name test files `*.test.ts` or `*.test.tsx` and co-locate them with the implementation. Unit tests belong on the pure helpers in `extract-open-graph.ts` (including `describeTab`), `evaluate-checks.ts` (including `splitCheckMessage` and `fallbackNote`) and `check-platforms.ts` (the check-id to platform map behind the tab issue dots): URL normalization, restricted pages, missing metadata, check messages, platform mapping. There is no coverage threshold. Do not require component tests for platform preview cards or popup chrome; those are reviewed visually.

## Commit & Pull Request Guidelines

Follow Conventional Commits used in history and enforced by commitlint, for example `feat: add LinkedIn preview` or `fix: resolve relative image URLs`. Keep commits scoped and imperative. Pull requests should explain the user-visible change, link relevant issues, note manual Chrome/Firefox verification, and include screenshots for popup or social-card UI changes. Preserve the minimal `activeTab` and `scripting` permissions unless a permission change is explicitly justified.

## Code Review Rules

Codex: post only findings that would ship a wrong card, drop tags, leak data, or expand permissions. Skip everything else. Prefer a 👍 with no comments over a wall of P2s.

### Do not report

- Formatting, imports, naming taste, comment density, extra abstractions, or anything Biome/`pnpm check` already covers.
- Unused helpers, types, or missing UI on a stacked PR. Later PRs in the same stack are allowed to wire them up.
- Missing tests for `platform-previews.tsx`, `preview-tabs.tsx`, or other React chrome. Tests are for extract/check helpers only.
- Horizontal scrolling of the tab strip. That layout is intentional.
- Hardcoded third-party colours, type, or crops inside platform cards. Fidelity beats taste; HeroUI tokens must not leak into those cards.
- Discord using `og:image` only (no `twitter:image` fallback). That matches Discord.
- Hypothetical timeouts, 403/405 HEAD bodies, mid-load layout shifts, or other speculative edge cases unless they already break the common path.
- Scope expansions: more platforms, host permissions, content scripts, cache busting, or “while you’re here” refactors.

### Do report

- New permissions beyond `activeTab` and `scripting`, or a content script, without an explicit justification.
- `readOpenGraphFromDocument` importing or closing over bindings (Chrome cannot inject it).
- A platform preview that would make a ship/no-ship decision using the wrong tags or the wrong card variant on the common path.
- Secrets or credentials in the diff.
