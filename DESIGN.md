---
name: Open Graph Preview
description: A 800px browser-extension popup that shows the current tab's og:image, its social cards, and the tags that produced them.
colors:
  background: "oklch(0.982 0.005 285)"
  foreground: "oklch(0.22 0.02 285)"
  surface: "oklch(1 0 0)"
  muted: "oklch(0.47 0.02 285)"
  border: "oklch(0.905 0.01 285)"
  default: "oklch(0.945 0.009 285)"
  accent: "oklch(0.54 0.21 282)"
  accent-soft: "oklch(0.945 0.035 282)"
  warning: "oklch(0.62 0.16 58)"
  warning-soft: "oklch(0.955 0.045 80)"
  success-soft: "oklch(0.95 0.04 155)"
  stage: "oklch(0.956 0.008 285)"
  background-dark: "oklch(0.165 0.012 285)"
  foreground-dark: "oklch(0.965 0.005 285)"
  surface-dark: "oklch(0.215 0.014 285)"
  muted-dark: "oklch(0.73 0.018 285)"
  accent-dark: "oklch(0.73 0.15 282)"
  stage-dark: "oklch(0.13 0.01 285)"
typography:
  heading:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "20px"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  meta:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    lineHeight: "18px"
rounded:
  stage: "1.5rem"
  card: "1rem"
  pill: "9999px"
spacing:
  gutter: "12px"
  stage-padding: "8px"
  section-gap: "16px"
---

# Design System: Open Graph Preview

## Direction

**Soft Modern surface on a Refined Instrument layout.**

The popup is still an instrument: you open it, look at a card, and decide
whether to ship. What changed is the finish. The chrome now has a quiet
identity (a violet app mark and a soft glow behind the header), elevated
surfaces with real shadows, a pill tab track with issue dots, and a dotted
**stage** that presents each platform card as a specimen.

One expressive surface, the header glow, and everything else stays calm. The
platform card is still the subject: the stage frames it, it never restyles it.

## Two systems, one border

- **Chrome** (header, tab track, stage, Checks, Raw tags, notes, empty
  states) is built from HeroUI components and HeroUI tokens only.
- **Platform cards** (`platform-previews.tsx`) are transcriptions of third-party
  UI with hardcoded hex, type and radii. They are never restyled. Chrome may
  only stage them from outside.
- **Cards never invert.** Each card renders inside
  `<div className="light" data-theme="light">`, which re-declares the light
  tokens for that subtree, so `PreviewImage` empty states and the Image tab
  letterbox stay light in dark mode. Discord is the exception: its embed is
  dark, so its wrapper is `className="dark" data-theme="dark"` and the empty
  state inside it reads on the dark card in both themes. Discord keeps its
  `theme-color` left bar (fallback `#202225`). The Image tab wrapper adds a
  1px `--border` ring so its light empty state has an edge on the stage.
- The two systems never share a value: a literal hex in the chrome is a bug, a
  theme token inside a card is a bug. Discord's `theme-color` bar is the one
  exception, because Discord draws it.

## Colour

Hue 285 neutrals with a hue 282 violet accent. Every value overrides a HeroUI
token name, so HeroUI components follow it. The overrides in
`entrypoints/popup/style.css` are unlayered and ordered **light**, then a
**`prefers-color-scheme: dark` first-paint fallback** on `:root`, then
**`.dark`**, so a light value is never pinned in dark mode.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | `oklch(0.982 0.005 285)` | `oklch(0.165 0.012 285)` | Popup field |
| `--foreground` | `oklch(0.22 0.02 285)` | `oklch(0.965 0.005 285)` | Primary text |
| `--surface` | `oklch(1 0 0)` | `oklch(0.215 0.014 285)` | Cards (Checks, Raw tags, empty states) |
| `--surface-secondary` | HeroUI default | `oklch(0.245 0.014 285)` | Light value left alone: the Image tab letterbox uses it |
| `--muted` | `oklch(0.47 0.02 285)` | `oklch(0.73 0.018 285)` | Secondary text |
| `--border`, `--separator` | `oklch(0.905 0.01 285)` | `oklch(1 0 0 / 0.09)` | Hairlines and rings |
| `--default` | `oklch(0.945 0.009 285)` | `oklch(0.27 0.014 285)` | Inline code, skeletons, hover fills |
| `--segment` | `oklch(1 0 0)` | `oklch(0.3 0.014 285)` | Selected tab pill |
| `--accent` | `oklch(0.54 0.21 282)` | `oklch(0.73 0.15 282)` | Focus ring |
| `--accent-soft` / `-foreground` | `0.945 0.035` / `0.45 0.2` | `0.3 0.07` / `0.86 0.08` | Copied state, cache note, restricted icon |
| `--warning` | `oklch(0.62 0.16 58)` | `oklch(0.8 0.14 75)` | Tab issue dots |
| `--warning-soft` / `-foreground` | `0.955 0.045 80` / `0.47 0.12 55` | `0.3 0.06 70` / `0.88 0.11 80` | Issue pill, check tiles, related-issue icon |
| `--success-soft` / `-foreground` | `0.95 0.04 155` / `0.44 0.11 155` | `0.29 0.05 155` / `0.86 0.1 155` | Clean state |
| `--stage` / `--stage-dot` | `0.956 0.008` / `0.88 0.012` | `0.13 0.01` / `0.26 0.014` | Dotted stage behind the card |
| `--glow-a` / `--glow-b` | violet 0.4 / pink 0.3 alpha | violet 0.32 / pink 0.18 alpha | Header glow |

Colour roles:

- **Violet accent**: focus rings, the app mark, the copied state, the cache
  note. Never used for emphasis inside content.
- **Warning**: issues. The header pill, the check tiles, the tab dots and the
  related-issue icon. Every check is a warning today, so the UI says "issues"
  and never prints a severity word.
- **Success**: the clean state only.

### Measured contrast (WCAG 2.x)

OKLCH converted to sRGB with alpha composited over what sits behind it.

| Pair | Light | Dark | Need |
|---|---|---|---|
| foreground / background | 16.47 | 17.41 | 4.5 |
| foreground / surface | 17.36 | 15.84 | 4.5 |
| muted / background | 6.50 | 8.04 | 4.5 |
| muted / surface | 6.86 | 7.31 | 4.5 |
| muted / stage | 6.02 | 8.39 | 4.5 |
| muted / stage dot (caption over dots, worst) | 4.77 | 6.49 | 4.5 |
| **muted / glow peak (header path line, worst)** | **4.66** | 5.02 | 4.5 |
| muted / tab track over glow | 5.80 | 6.31 | 4.5 |
| foreground / segment (selected tab) | 17.36 | 12.34 | 4.5 |
| muted / default (chips) | 5.83 | 6.29 | 4.5 |
| foreground / default (inline code) | 14.76 | 13.63 | 4.5 |
| warning-soft-foreground / warning-soft | 6.21 | 9.52 | 4.5 |
| warning-soft-foreground / stage (related icon) | 6.25 | 13.91 | 3 |
| success-soft-foreground / success-soft | 6.44 | 9.39 | 4.5 |
| accent-soft-foreground / accent-soft | 6.85 | 8.89 | 4.5 |
| foreground / note | 15.18 | 15.44 | 4.5 |
| muted / note | 6.00 | 7.13 | 4.5 |
| accent focus ring / background | 5.21 | 7.74 | 3 |
| warning dot / tab track | 3.23 | 7.95 | 3 |
| warning dot / segment | 3.82 | 7.18 | 3 |
| light muted / card empty-state backgrounds | 6.11 to 6.86 | light-pinned | 4.5 |

Borders (1.33 light, 1.29 dark) are decorative; no information relies on them.

**Re-measure muted over the glow whenever `--glow-a` or `--glow-b` alphas
change.** At the mockup's original alphas (0.45 / 0.38) the header path line
measured 4.48:1 and failed.

HeroUI Pro's `TextShimmer` rests on `currentColor` at 45% alpha, which is
under 4.5:1. The header's "Reading tags" shimmer (`.status-shimmer`) rests on
`--muted` and sweeps to `--foreground` instead, and keeps muted at full opacity
under reduced motion.

## Type

System only: the HeroUI sans stack and Tailwind's `font-mono` (ui-monospace).

| Role | Size | Used for |
|---|---|---|
| Heading | 15/20, 600, -0.012em | Host line, section titles (Checks, Raw tags) |
| Body | 14/20 | Check lead, empty-state description |
| Meta | 13/18 | Paths, captions, check detail, notes, chips, tab labels |
| Mono | 13/18 | Tag names, URLs, numbers, card types, inline code in messages |

**13px is the chrome floor.** HeroUI ships 12px in several places, and
`style.css` raises each one: `Chip`, the Pro `ItemCard` and `ItemCardGroup`
descriptions, the OSS `Table` column header, and the Pro `EmptyState` `sm`
title and description (16/20 and 14/20).

Inside the cards the type is transcribed from each platform and is not part of
this scale.

## Elevation

- `--shadow-card`: 1px ring plus two soft violet-grey drop shadows in light;
  ring plus a 4% top highlight in dark. `--surface-shadow` points at it, so
  HeroUI `Card`, `ItemCard` and `ItemCardGroup` pick it up.
- `--shadow-pill`: the selected tab pill and the tab scroll chevrons.
- Stage: an inset ring and a faint inset top shadow, with a 12px dot grid.
- Platform cards never receive a shadow. They do not use HeroUI `Card`.

## Iconography

- `gravity-ui` for chrome, `simple-icons` for platform glyphs in the tab strip.
  All monochrome `currentColor`. The selected tab glyph is foreground, not
  accent.
- Bundled offline: `vite-icon-subset.ts` exposes `virtual:icon-subset` with only
  the icons in `ICON_NAMES`, and `main.tsx` registers them with `addCollection`.
  The popup never requests `api.iconify.design`. **Adding an icon means adding
  its name to `ICON_NAMES`.**
- No favicons in the chrome. The header identity is `tab.url` and `tab.title`.

## HeroUI component map

The user builds on both HeroUI OSS (`@heroui/react`, `@heroui/styles`) and
HeroUI Pro (`@heroui-pro/react`). Chrome is assembled from these first.

| Chrome element | Component | Package |
|---|---|---|
| App mark | `Avatar size="sm"` + `Avatar.Fallback` (no `Avatar.Image`) | OSS |
| Status: loading | `TextShimmer` | Pro |
| Status: restricted / error | `Chip variant="soft"` + `Chip.Label` | OSS |
| Status: ready | `Button size="sm" variant="tertiary"`, tinted through `--button-bg` / `--button-fg` | OSS |
| Tab strip | `Tabs` (`ListContainer`, `List`, `Tab`, `Indicator`, `Panel`). `ListContainer` already wraps the list in HeroUI's `ScrollShadow` with scroll chevrons | OSS |
| Tab issue dot | `Badge.Anchor` around the tab icon + `Badge size="sm" color="warning" variant="primary" placement="top-right"` | OSS |
| Card-type caption | `Chip size="sm" variant="tertiary"` | OSS |
| "N more in Checks" | `Link` with `onPress` | OSS |
| Checks | `ItemCardGroup` (`Header`, `Title`, `Description`) + `ItemCard` (`Icon`, `Content`, `Title`, `Description`), `Separator` between rows | Pro + OSS |
| Raw tags | `Card` (`Header`, `Title`, `Description`, `Content`) holding one `Table variant="secondary"` per group, `Separator` between groups | OSS |
| Not set marker | `Chip size="sm" variant="tertiary"`, dashed border | OSS |
| theme-color swatch | `ColorSwatch size="xs" shape="square"`, only when `CSS.supports` and `parseColor` both accept the value | OSS |
| Copy buttons | `Button isIconOnly variant="ghost"` as the direct child of `Tooltip` (no `Tooltip.Trigger`, which adds an unnamed `role="button"` wrapper), 13px tooltip text | OSS |
| Cache note | `Alert status="accent"` (`Indicator`, `Content`, `Description`) | OSS |
| Restricted / error body | `Card` around `EmptyState` | OSS + Pro |
| Loading | `Skeleton animationType="shimmer"` | OSS |

Hand-rolled, with reasons:

- **Stage dot grid** and **header glow**: no component draws either.
- **Host and path lines**: `Typography` has no 15px size and its 12px size is
  under the floor.
- **Card light-scope wrapper**: a plain `div`.

HeroUI Pro ships its component CSS unlayered, which would beat every Tailwind
utility passed as `className`. `style.css` imports it with
`layer(components)` so Pro components take `className` overrides the same way
OSS components do.

## Layout

800px fixed width (Chrome's popup maximum), 12px gutter. The stage is wider
than most platforms draw a link card, so each card's wrapper caps it at the
platform's approximate width and centres it (`widthClassName` in
`PLATFORM_TABS`): X 516px, Facebook 500px, LinkedIn 552px, Discord 432px,
WhatsApp 396px, Reddit 640px. Slack fills the stage, and the Image tab is capped
at 600px so Checks start above the 600px fold. A card
must never be drawn wider than the platform draws it. Top to bottom, in every
ready state:

1. **Header** (`popup-header.tsx`, shared by every state): glow, app mark, host
   (15px semibold) over path (13px mono, muted), status on the right.
2. **Tab track**: a translucent pill with a hairline ring. Tabs carry a glyph,
   the platform name, and a warning dot when that platform has an issue. The
   strip scrolls horizontally; it never wraps. HeroUI's fade (shortened to
   28px) and chevrons appear only while there is more to scroll, and
   `scroll-padding-inline` keeps an arrow-key-focused tab clear of both.
3. **Stage**: a dotted `rounded-3xl` well with 8px padding. A caption row
   (platform name, the `twitter:card` value on X, Slack and Discord, and the
   image dimensions or "No image" / "Did not load"), then the light-scoped
   card, then the related-issue line when that platform has checks.
4. **Checks**, 5. **Raw tags**, 6. **Cache note**.

Dimensions are only shown for the image they were measured from (`tags.image`),
never against X's separate `twitter:image`.

## Components

### Header status

- Loading: "Reading tags" shimmer, faded in after 300ms.
- Restricted: "Not readable". Error: "No result". Both are chips, not buttons.
- Ready: "N issues" (warning) or "No issues" (success). Pressing it focuses
  the Checks section and scrolls it into view (instant under reduced motion).
  Accessible name: "N issues. Go to Checks".

### Tab dots and the related-issue line

Both come from one pure module, `check-platforms.ts`. A check maps to a
platform when it changes what that platform's card in this popup draws
(fallback text, fallback or missing image, card variant, length limit) or its
message names that platform. `CHECK_PLATFORMS` holds the platforms that hold on
every page; `checksForPlatform(checks, platform, tags)` adds the ones that
depend on the tags: a broken or missing image reaches every card that draws
that URL (`platformImage`), and `image-file-size` reaches Facebook above 8 MB.
Page-wide checks map to no platform. The dot is a HeroUI `Badge` on the tab
icon, at the tab's start, so the strip's scroll chevron never covers it. It is
`aria-hidden`; the count is in the tab's accessible name. The
related line quotes the first matching check verbatim, then links "N more in
Checks". Messages are never rewritten per platform.

### Checks

One `ItemCardGroup`. The header shows "Checks" and the count, plus a copy
button that copies the page URL and every message. Each row is a warning tile
and the message split at its first sentence (`splitCheckMessage`): the lead in
14px, the detail in 13px muted. Tag names in messages render as inline code.
Clean state: one success row, "No issues in the tags this popup can see." and
"N of 12 tags set."

### Raw tags

One `Card`, three groups (Open Graph, X, Other), each its own `Table` because
React Aria tables have no row groups. Tag names are mono and muted; values are
mono for URLs, numbers and card types, sans for prose. Values wrap in full. An
empty value shows a dashed "Not set" chip and, when `fallbackNote` knows one,
what previews use instead. `theme-color` shows a swatch only when both
`CSS.supports("color", value)` and `parseColor(value)` accept it, so a
page-controlled string never reaches a style. Copy buttons are always visible.

### Empty states

- Inside cards (unchanged): "No og:image" and "Image failed to load", light in
  both schemes.
- Restricted / error: a `Card` holding `EmptyState` with a soft accent (lock)
  or soft warning (circle-exclamation) tile. The header still shows the tab.
- Loading: skeletons for the tab track, caption and 1.91:1 image, faded in after
  300ms.
- No action buttons. The fix lives in the user's HTML.

### Platform cards (unchanged)

Transcriptions, not components. Hardcoded hex, no theme tokens, no shared
abstraction. X uses the large card for `summary_large_image` and `player`, the
small card otherwise. Discord reads `og:image` only and follows `twitter:card`
and image aspect. Slack's 4px accent bar and Discord's `theme-color` bar are
the only thick side borders allowed, because those platforms draw them. The
Image tab uses `object-contain` (what you made); cropping cards use
`object-cover` (what survives).

## Motion

| Element | Motion | Reduced motion |
|---|---|---|
| Tab indicator | HeroUI default CSS transition, 250ms | Off (HeroUI `motion-reduce`) |
| Copy feedback | Icon fade and zoom-in, 150ms; tint `transition-colors` 150ms | `motion-reduce:animate-none` / `transition-none` |
| Loading | Fade in after 300ms; `Skeleton` shimmer; `TextShimmer` | Fade off; `.skeleton` and `.text-shimmer` animation off |
| Status pill to Checks | `scrollIntoView` smooth | `behavior: "auto"` |

No motion on the glow, the app mark, or the status pill.

## Dark mode

`main.tsx` reads `prefers-color-scheme` and sets `.dark` or `.light` plus
`data-theme` on `<html>`, and updates them live when the OS setting changes.
MV3 blocks inline scripts, so `style.css` also carries a
`prefers-color-scheme: dark` block on `:root` that paints the right background
before the module runs. Cards never invert.

## Accessibility

- WCAG 2.2 AA on chrome (table above). Cards are exempt on copied colour and
  type only; their structure is held to AA.
- 13px minimum chrome text.
- Focus ring is the accent (5.21:1 light, 7.74:1 dark).
- Tab accessible names include the issue count ("Slack, 2 issues").
- Every motion respects `prefers-reduced-motion`.
- The cache note is an `Alert` without `role="alert"`, so it is not announced
  on every open.

## Do's and don'ts

**Do**

- Build chrome from HeroUI OSS and Pro components first, styled through tokens
  and `className`.
- Keep every card inside the light-scoped wrapper.
- Name the tag or URL at fault. Flat, factual copy.
- Re-measure contrast after changing any token or glow alpha.

**Don't**

- Restyle, re-token, or add shadows to a platform card.
- Invent a verdict, score or severity word.
- Put chrome text under 13px.
- Use favicons in the chrome, or load icons from the network.
- Draw fake browser chrome or phone bezels around a card.
