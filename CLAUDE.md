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
```

CI (`.github/workflows/ci.yml`) runs check, test, compile, and build. Husky hooks run gitleaks + lint-staged (pre-commit) and commitlint conventional commits (commit-msg).

## Architecture

A WXT + React 19 browser extension with a **single popup entrypoint** — no background script, no content script. Everything lives in `entrypoints/popup/`.

Data flow, popup open → render:

1. `use-open-graph-preview.ts` queries the active tab, rejects it early via `isRestrictedTabUrl`, then calls `browser.scripting.executeScript` with `readOpenGraphFromDocument`.
2. `readOpenGraphFromDocument` (in `extract-open-graph.ts`) runs **in the page**. It must stay self-contained — no imports, no closed-over bindings — because Chrome serializes the function body. Anything it needs must be declared inside it.
3. The hook resolves the returned `image` against the tab URL (`resolveOgImageUrl`) so relative Next.js `opengraph-image` paths work on localhost, and exposes a `PreviewState` union: `loading | restricted | error | ready`.
4. `app.tsx` switches on that union; `preview-tabs.tsx` owns the shared `imageBroken` flag (one `<img onError>` failure marks the image broken across every tab) and fans props out to `platform-previews.tsx`.

`platform-previews.tsx` holds one component per surface (og:image, X, Facebook, LinkedIn, Slack). These deliberately hardcode each platform's brand colours and card geometry as literal Tailwind values rather than theme tokens — they are pixel imitations of third-party UI, not app chrome. `preview-image.tsx` centralises the missing/broken image empty states.

Permissions are `activeTab` + `scripting` only (`wxt.config.ts`). Do not add host permissions or a content script without a reason — the store listing and `PRIVACY.md` claim no data collection and no persistent page access.

`extract-open-graph.ts` is the only unit-tested module; its pure helpers (`resolveOgImageUrl`, `isRestrictedTabUrl`, `displayHostname`) are deliberately separated from the injected function and from React so they can be tested without a DOM.

## Conventions

- Biome, not ESLint/Prettier: double quotes, space indent, organize-imports on.
- Relative imports carry explicit extensions (`./app.tsx`, `./extract-open-graph.ts`) — `allowImportingTsExtensions` is on.
- UI comes from `@heroui/react` and `@heroui-pro/react` (v3 compound components: `EmptyState.Header`, `Tabs.Panel`). Pro CSS is imported per-component in `style.css`.
- Popup width is fixed at 420px in `style.css`; layouts must work at that width.
- `marketing/` holds the finished Chrome Web Store artwork (screenshots, promo tile). Image assets only — no build step, not part of the extension bundle.

## Design Context

Read [PRODUCT.md](PRODUCT.md) before any UI work; [DESIGN.md](DESIGN.md) carries the visual system. The rules that catch people out:

- **Fidelity over taste.** Inside a platform card, the platform's design wins. Making a card look better than the real thing is a correctness bug, not an improvement — it produces a wrong ship/no-ship decision.
- **Two systems, one border.** App chrome uses HeroUI tokens (`bg-background`, `text-foreground`, `bg-surface-secondary`). Platform cards use hardcoded third-party hex. Neither leaks into the other.
- **Accessibility.** WCAG 2.2 AA on app chrome. The platform cards are exempt on copied colour and type values only — structure (alt text, semantics, keyboard, focus) is held to AA everywhere.
- Voice is flat and specific: name the tag or URL at fault. No exclamation marks, no apologies.
