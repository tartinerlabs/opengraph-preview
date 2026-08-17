# Open Graph Preview

Browser extension that reads the current tab’s Open Graph tags and previews the standalone `og:image`, plus how it would look on X, Facebook, LinkedIn, Slack, Discord, WhatsApp, and Reddit. A Tags tab lists the live values and names crawler-invisible tags.

Unlike websites such as metatags.io, this works on **localhost** — it reads the HTML already rendered in the tab, including Next.js `opengraph-image` / `generateMetadata` output.

## Develop

```bash
pnpm install
pnpm dev
```

Load the unpacked extension from `.output/chrome-mv3-dev` (Chrome) or run `pnpm dev:firefox`. Open a local Next.js route (or any page with OG tags) and click the toolbar icon.

Permissions are `activeTab` and `scripting` only. Browser-internal pages (`chrome://`, the Web Store) cannot be inspected.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` / `pnpm dev:firefox` | WXT dev server → `.output/chrome-mv3-dev` |
| `pnpm build` / `pnpm build:firefox` | Production bundle |
| `pnpm zip` / `pnpm zip:firefox` | Store-ready archive in `.output/` |
| `pnpm check` / `pnpm format` | Biome lint + format (check / write) |
| `pnpm compile` | `tsc --noEmit` |
| `pnpm test` | Vitest suite |

CI runs `check`, `test`, `compile`, and `build` — run all four before opening a pull request.

## Layout

The extension is a single popup entrypoint (no background or content script). Everything lives in `entrypoints/popup/`:

- `use-open-graph-preview.ts` — queries the active tab and injects the extractor via `browser.scripting.executeScript`
- `extract-open-graph.ts` — the injected, self-contained reader plus pure URL helpers; returns og vs twitter provenance, `twitter:card`, `theme-color`, and source-vs-live tag diffs (unit-tested)
- `evaluate-checks.ts` — ship/no-ship checks over those tags (unit-tested)
- `app.tsx`, `preview-tabs.tsx`, `platform-previews.tsx`, `preview-image.tsx` — UI states and one component per platform surface; the tab strip (Image, X, Facebook, LinkedIn, Slack, Discord, WhatsApp, Reddit, Tags) scrolls horizontally

`marketing/` holds the finished Chrome Web Store artwork and is not part of the extension bundle. `.wxt/` and `.output/` are generated.

## Contributing

See [AGENTS.md](AGENTS.md) for structure, coding style, and commit conventions (Conventional Commits, enforced by commitlint). [CLAUDE.md](CLAUDE.md) adds architecture notes for AI coding agents.
