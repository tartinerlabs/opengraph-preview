@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is pnpm (`pnpm-lock.yaml`, `savePrefix: ""` — dependencies are pinned exactly, so add packages without ranges).

```bash
pnpm dev                    # WXT dev server -> .output/chrome-mv3-dev (load unpacked)
pnpm dev:firefox            # same for Firefox
pnpm build                  # wxt build  -> .output/chrome-mv3
pnpm zip                    # store-ready zip in .output/
pnpm check                  # Biome lint + format check
pnpm format                 # Biome check --write
pnpm compile                # tsc --noEmit
pnpm test                   # vitest run
pnpm vitest run entrypoints/popup/extract-open-graph.test.ts   # single test file
pnpm vitest run entrypoints/popup/evaluate-checks.test.ts      # same for checks
pnpm vitest run entrypoints/popup/check-platforms.test.ts      # check-id -> platform map
```

CI (`.github/workflows/ci.yml`) runs check, test, compile, and build. Husky hooks run gitleaks + lint-staged (pre-commit) and commitlint conventional commits (commit-msg).

Store releases (`.github/workflows/release.yml`) run semantic-release after CI succeeds on `main`, then zip Chrome and run `wxt submit` against the Chrome Web Store API v2. Do not push version tags by hand. Do not add Firefox/Edge submit flags until those listings exist. Credentials and IDs are documented in [AGENTS.md](AGENTS.md).

## Architecture

A WXT + React 19 browser extension with a **single popup entrypoint** — no background script, no content script. Everything lives in `entrypoints/popup/`.

Data flow, popup open → render:

1. `use-open-graph-preview.ts` queries the active tab, rejects it early via `isRestrictedTabUrl`, then calls `browser.scripting.executeScript` with `readOpenGraphFromDocument`.
2. `readOpenGraphFromDocument` (in `extract-open-graph.ts`) runs **in the page**. It must stay self-contained — no imports, no closed-over bindings — because Chrome serializes the function body. Anything it needs must be declared inside it.
3. The extractor returns provenance alongside the preview fields: separate og vs twitter image/title/description, `twitter:card`, `theme-color`, and `crawlerInvisibleTags` (present in the live DOM but missing from the HTML source). The hook resolves `image`, `ogImage`, and `twitterImage` against the tab URL (`resolveOgImageUrl`) so relative Next.js `opengraph-image` paths work on localhost, and exposes a `PreviewState` union: `loading | restricted | error | ready`. Every state carries `tab` (`{ title, url }` from the active tab, readable under `activeTab`; null only before `tabs.query` resolves or when there is no tab), which the header shows via `describeTab()`.
4. `app.tsx` switches on that union and renders `PopupHeader` (`popup-header.tsx`: app mark, tab identity, status) in every state. `preview-tabs.tsx` tracks broken image URLs (one `<img onError>` failure marks that URL broken, not every card), runs `evaluateChecks`, and stages each card from `platform-previews.tsx` on a dotted stage inside a `data-theme="light"` wrapper so cards never invert (Discord's wrapper is `data-theme="dark"`, matching its dark embed). The tab strip (Image, X, Facebook, LinkedIn, Slack, Discord, WhatsApp, Reddit) is one `PLATFORM_TABS` table and scrolls horizontally via `Tabs.ListContainer`. `check-platforms.ts` (`CHECK_PLATFORMS` plus the tags-aware `checksForPlatform`) decides which checks belong to which tab: it drives the tab issue dots and the related-issue line under each card. Checks and Raw tags render below the panel on every tab.

`platform-previews.tsx` holds one component per surface (og:image, X, Facebook, LinkedIn, Slack, Discord, WhatsApp, Reddit). These deliberately hardcode each platform's brand colours and card geometry as literal Tailwind values rather than theme tokens — they are pixel imitations of third-party UI, not app chrome. **Discord's left bar is the exception:** it uses the page `theme-color` (falling back to `#202225`) because Discord does. `preview-image.tsx` centralises the missing/broken image empty states.

Permissions are `activeTab` + `scripting` only (`wxt.config.ts`). Do not add host permissions or a content script without a reason — the store listing and `PRIVACY.md` claim no data collection and no persistent page access.

`extract-open-graph.ts`, `evaluate-checks.ts` and `check-platforms.ts` are the unit-tested modules. The extractor's pure helpers (`resolveOgImageUrl`, `isRestrictedTabUrl`, `displayHostname`, `describeTab`) are deliberately separated from the injected function and from React so they can be tested without a DOM; `evaluate-checks.ts` (plus `splitCheckMessage`, `fallbackNote`) and `check-platforms.ts` are pure functions over those tags for the same reason. `CHECK_PLATFORMS` is typed `Record<CheckId, …>`, so a new check id does not compile until it is mapped.

Icons are bundled offline: `vite-icon-subset.ts` (registered in `wxt.config.ts`) exposes `virtual:icon-subset` with only the icons named in `ICON_NAMES`, and `main.tsx` registers them with `addCollection`, so `@iconify/react` never calls `api.iconify.design`. Adding an icon means adding its name to `ICON_NAMES`.

Dark mode: `main.tsx` sets `.dark`/`.light` and `data-theme` on `<html>` from `prefers-color-scheme` and follows changes live; `style.css` carries a `prefers-color-scheme` fallback on `:root` for first paint (MV3 blocks inline scripts).

## Conventions

- Biome, not ESLint/Prettier: double quotes, space indent, organize-imports on.
- Relative imports carry explicit extensions (`./app.tsx`, `./extract-open-graph.ts`) — `allowImportingTsExtensions` is on.
- UI comes from `@heroui/react` and `@heroui-pro/react` (v3 compound components: `EmptyState.Header`, `Tabs.Panel`). Build chrome from HeroUI OSS and Pro components first; DESIGN.md has the component map. Pro CSS is imported per-component in `style.css` with `layer(components)`, because Pro ships unlayered CSS that would otherwise beat `className` utilities.
- Popup width is fixed at 800px in `style.css`; layouts must work at that width.
- `marketing/` holds the finished Chrome Web Store artwork (screenshots, promo tile). Image assets only — no build step, not part of the extension bundle.

## Design Context

Read [PRODUCT.md](PRODUCT.md) before any UI work; [DESIGN.md](DESIGN.md) carries the visual system. The rules that catch people out:

- **Fidelity over taste.** Inside a platform card, the platform's design wins. Making a card look better than the real thing is a correctness bug, not an improvement — it produces a wrong ship/no-ship decision.
- **Two systems, one border.** App chrome uses HeroUI tokens (`bg-background`, `text-foreground`, `bg-surface`). Platform cards use hardcoded third-party hex, except Discord's `theme-color` bar, and render inside a `className="light" data-theme="light"` wrapper so they stay light in dark mode (Discord keeps its dark embed). Neither leaks into the other. Never restyle a card; chrome only stages it.
- **No verdicts.** Every check is an issue of the same kind; the UI says "issues" and quotes check messages verbatim.
- **Accessibility.** WCAG 2.2 AA on app chrome. The platform cards are exempt on copied colour and type values only — structure (alt text, semantics, keyboard, focus) is held to AA everywhere.
- Voice is flat and specific: name the tag or URL at fault. No exclamation marks, no apologies.
