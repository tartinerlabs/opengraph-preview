# Open Graph Preview

Browser extension that reads the current tab’s Open Graph tags and previews how `og:image` would look on X, Facebook, LinkedIn, and Slack.

Unlike websites such as metatags.io, this works on **localhost** — it reads the HTML already rendered in the tab, including Next.js `opengraph-image` / `generateMetadata` output.

## Develop

```bash
pnpm install
pnpm dev
```

Load the unpacked extension from `.output/chrome-mv3-dev` (Chrome) or run `pnpm dev:firefox`. Open a local Next.js route (or any page with OG tags) and click the toolbar icon.

Permissions are `activeTab` and `scripting` only. Browser-internal pages (`chrome://`, the Web Store) cannot be inspected.
