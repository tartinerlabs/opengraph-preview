---
name: Open Graph Preview
description: A 420px browser-extension popup that shows the current tab's og:image, its social cards, and the tags that produced them.
colors:
  background: "oklch(0.9702 0 0)"
  foreground: "oklch(0.2103 0.0059 285.89)"
  surface: "oklch(100% 0 0)"
  surface-secondary: "oklch(0.9524 0.0013 286.37)"
  muted: "oklch(0.535 0.0138 285.94)"
  border: "oklch(90% 0.004 286.32)"
  accent: "oklch(0.6204 0.195 253.83)"
  danger: "oklch(0.6532 0.2328 25.74)"
  background-dark: "oklch(12% 0.005 285.823)"
  foreground-dark: "oklch(0.9911 0 0)"
  surface-secondary-dark: "oklch(0.257 0.0037 286.14)"
  muted-dark: "oklch(70.5% 0.015 286.067)"
  border-dark: "oklch(28% 0.006 286.033)"
typography:
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "20px"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "16px"
rounded:
  field: "0.75rem"
  md: "0.5rem"
  lg: "1rem"
spacing:
  gutter: "12px"
  gap: "8px"
  panel-top: "8px"
components:
  preview-frame:
    backgroundColor: "{colors.surface-secondary}"
    rounded: "{rounded.lg}"
    width: "396px"
  popup-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    padding: "12px"
    width: "420px"
  empty-state:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted}"
    padding: "12px"
---

# Design System: Open Graph Preview

## Overview

**Creative North Star: "The Contact Sheet"**

A photographer's contact sheet exists to let you judge frames. The sheet itself is
a neutral field, printed edge to edge, with no styling of its own — because
anything the sheet does visually is a thing you might mistake for something in
the frame. This popup works the same way. The platform cards are the frames.
The chrome around them is the sheet — including the Tags tab, which is a
report on the frames, not a frame itself.

That single idea resolves nearly every visual decision here. The chrome is
colourless because the cards are full of other companies' brand colour, and the
only way that colour reads as *theirs* is if none of it is ours. The chrome is
flat because a shadow under a card would say the card is floating in a feed, when
in fact it is a specimen pinned to a field. The type scale is short and the
weights are few because the user is not reading the interface — they are looking
past it, at an image, deciding whether to ship.

The result should feel like an instrument someone left on the desk: unbranded,
uncomplaining, correct. Its confidence comes from being exactly right about small
things — a 1.91:1 aspect ratio that matches what the platform actually crops to,
a hostname rendered in the platform's real metadata grey — and never from
presentation.

**Key Characteristics:**

- Two visual systems with a hard border: neutral chrome, verbatim platform cards
- Flat by default; depth is tonal, never cast
- Colour appears almost exclusively inside the previews
- One click to a platform, never two; the popup is read in seconds
- Composed for 420px, not squeezed into it

## Colors

A deliberately colourless chrome — HeroUI's near-neutral gray-violet ramp,
carrying about 0.001–0.014 chroma — wrapped around previews that supply all the
real colour on screen.

### Primary

- **Signal Blue** (`oklch(0.6204 0.195 253.83)`): the accent, reserved for focus
  rings. That is currently its only appearance — tab selection is carried by the
  white pill, not by colour — so in practice the chrome renders with no saturated
  colour at all until something takes focus. It is the only saturated colour the
  chrome is *permitted*, and it is not used for emphasis, links, or decoration —
  see The Borrowed Colour Rule.

### Neutral

- **Paper** (`oklch(0.9702 0 0)`): the popup field. A true neutral at chroma 0 —
  no warm tint, no cool tint. It is backing, not atmosphere.
- **Eclipse** (`oklch(0.2103 0.0059 285.89)`): all primary text. Near-black with
  a trace of violet, matching the neutral ramp's hue.
- **Frame Grey** (`oklch(0.9524 0.0013 286.37)`): the letterbox behind the
  standalone `og:image`. Sits one step under Paper so a transparent or
  short-of-frame PNG shows its own edges rather than dissolving into the field.
- **Muted** (`oklch(0.535 0.0138 285.94)`, `#6c6c75`): secondary and supporting
  copy, including the empty-state descriptions. Measures **4.76:1** on Paper
  (`#f5f5f5`) and **4.51:1** on Frame Grey — both clear the 4.5:1 body-text
  minimum. HeroUI's stock `--muted` is one step lighter
  (`oklch(0.5517 …)`, `#71717a`) and fails both at 4.43:1 and 4.20:1, so
  `entrypoints/popup/style.css` overrides the token in `:root`.
- **Hairline** (`oklch(90% 0.004 286.32)`): borders and separators in the chrome
  at 1px. Never thicker, never coloured.

### Status

- **Danger** (`oklch(0.6532 0.2328 25.74)`): reserved for genuine failure. A
  missing `og:image` is *not* a failure — it is the answer to the user's
  question, and it renders in neutral empty-state colours.

### Dark

Dark is a first-class mode, not an afterthought: this runs in developer browsers,
and a 420px sheet of white at night is a flashbang. The chrome inverts to
**Ink** (`oklch(12% 0.005 285.823)`) on **Snow** (`oklch(0.9911 0 0)`), with
Muted lifting to `oklch(70.5% 0.015 286.067)` to hold contrast.

**The Cards Don't Invert Rule.** The platform previews stay in the colours those
platforms actually render. X, Facebook, LinkedIn, Slack, WhatsApp, and Reddit
cards stay light for most recipients, so inverting them would show the user a
card that does not exist. Discord's embed is dark; it stays dark in light
chrome. The seam between chrome and a card is correct; it is the boundary
between our surface and someone else's.

### Named Rules

**The Borrowed Colour Rule.** Every colour inside a preview card belongs to the
platform being imitated and is written as a literal hex value, never a theme
token. Every colour outside a preview card belongs to the chrome and is written
as a token, never a literal. A literal hex in the chrome is a bug; a token inside
a card is a bug. The two systems must never resolve to the same source.

**The One Accent Rule.** Signal Blue marks focus and selection. Nothing else.
Facebook and Slack both use blue inside their cards; if our blue starts meaning
"important", the user has to work out whose blue they're looking at.

## Typography

**Body Font:** the system UI stack (`ui-sans-serif, system-ui, sans-serif`)
**Card Fonts:** each platform's own stack — Facebook renders in
`Helvetica, Arial, sans-serif`; the rest use the system sans

**Character:** unremarkable on purpose. The chrome speaks in the host OS's own
voice so it reads as part of the browser rather than as a designed artifact. The
only typographic personality on screen belongs to the platforms.

### Hierarchy

- **Title** (600, 16px/20px): empty-state headings — "No og:image", "Restricted
  page". One line, stated as fact.
- **Body** (400, 14px/20px): empty-state descriptions and supporting copy.
- **Label** (400, 13px/16px): tab labels and the smallest chrome text. This is
  the floor — nothing in the chrome goes under 13px, however tempting at 420px.

Inside the cards the scale is not ours: X's title runs 15px/20px, Facebook's
16px/20px semibold over a 12px uppercase domain, LinkedIn's 14px/20px semibold
over 12px metadata, Slack's 15px/20px bold, Discord's 16px/20px title over
12px site name, WhatsApp's 14px/16px title over a 12px domain, Reddit's
16px/20px title. These are transcriptions and are not part of this hierarchy.

### Named Rules

**The Transcription Rule.** Type inside a card is measured from the platform, not
derived from this scale. If a value here and a value there disagree, the platform
wins and the difference is documented, not reconciled.

**The Flat Voice Rule.** Copy states what is true and names the specific thing at
fault — "This document has no Open Graph or Twitter image tag", not "Oops!"
No exclamation marks, no apologies, no encouragement. Sentence case throughout;
the only uppercase on screen is Facebook's domain line, which is theirs.

## Layout

A single fixed column, 420px wide, locked in `style.css`. This is the design's
one hard measurement and everything is composed to it rather than squeezed into
it: a 12px gutter leaves a 396px content width, which at 1.91:1 gives a 207px
preview — the height that sets the popup's proportion.

Vertical rhythm runs on three steps: 12px around the shell, 8px between the tab
strip and the panel, 8px inside a card's text block. Card internals follow the
platform (Facebook and LinkedIn pad 16px horizontal, 8px vertical; Slack indents
12px from its accent bar).

Structure is one tab strip over one panel. The strip scrolls horizontally when
labels overflow 420px; it does not wrap. There is no scrolling in the common
preview case and no responsive behaviour — the popup has exactly one viewport,
which is what makes 420px a design surface rather than a breakpoint. The Tags
tab is taller when it lists issues and raw tags; that height is content, not a
second screen.

The image-led surfaces — Image, X large card, Facebook, LinkedIn, Reddit —
reserve a 1.91:1 box before the image loads, so a slow or broken URL never
collapses the layout mid-render. **Slack, WhatsApp, and X summary are the
exceptions:** they render a square thumbnail beside the text, because that is
those platforms' real unfurl geometry. Discord switches: large image below the
text when `twitter:card` is `summary_large_image` (or the image is wide), small
thumbnail on the right otherwise.

Popup height therefore varies by tab, and by how much text a card has. That
variation is a consequence of transcribing different layouts and is accepted.
What is held constant is that height is stable *within* a tab — it does not
change as an image loads, fails, or is retried. **Discord's large-image layout
is the exception:** the image has no reserved aspect box (`max-h-[300px]` only),
so popup height can grow when that image loads. That matches Discord's embed.

### Named Rules

**The No Second Screen Rule.** Choosing a platform costs one click on the tab
strip; nothing costs two. Horizontal overflow on the strip is still one click.
A chrome issue count that selects Tags is still one click. No disclosures,
accordions, hover-only content, or wrapping the tabs onto a second row. Within
a tab, everything is visible at once. They are here for four seconds.

## Elevation & Depth

Flat, with one inherited exception.

Depth is tonal: Paper for the field, Frame Grey one step down for the letterbox
behind an image. That single step is the entire depth vocabulary, and it exists
for a functional reason — to reveal the edges of a transparent or undersized
image — not to suggest layering.

The exception is HeroUI's selected-tab pill, which ships with `--surface-shadow`
(`0 2px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06), 0 0 1px
rgba(0,0,0,0.06)`). It is a component default rather than a decision made here,
it is barely perceptible at this scale, and it disappears entirely in dark mode
where `--surface-shadow` resolves to transparent. Left as-is; overriding a
library default to satisfy a rule about our own authoring would be pedantry.
No *new* shadow should be added.

A shadow under a preview card would read as "this card is floating in a feed",
which is precisely the wrong claim. The cards are specimens on a sheet.

Store artwork is the one place this does not apply. The finished screenshots in
`marketing/` show the popup casting a drop shadow over a browser window, because
there it is being depicted as a floating panel. That is a photograph of the
product, not the product.

### Named Rules

**The Flat Sheet Rule.** No hand-authored `box-shadow` in `entrypoints/popup/`.
Depth is a background-colour step or it does not exist. HeroUI's own component
shadows are inherited, not authored, and are exempt.

## Shapes

Two radius languages, matching the two colour systems.

The chrome uses generous, soft corners: `rounded-2xl` (16px) on the standalone
preview frame, HeroUI's `--radius` (8px) and `--field-radius` (12px) on
controls. Soft enough to feel like part of a modern browser popup, plain enough
to disappear.

Card corners are transcribed: X at 16px, LinkedIn at 8px, Facebook square,
Slack square with a 4px left accent bar, Discord with a 4px `theme-color` bar
on a dark embed, WhatsApp at 8px, Reddit at 8px. **Slack's bar and Discord's
bar are a deliberate, scoped exception to the general prohibition on thick
side-stripe borders** — they are what those platforms actually draw, and
removing them would make the imitation wrong. They are permitted inside
`SlackPreview` and `DiscordPreview` and nowhere else.

Borders throughout are 1px hairlines. Nothing in the chrome uses a border to
decorate; a border either bounds a real container or it is removed.

## Components

### Tab Strip

- **Character:** a plain segmented control. Labels overflow into HeroUI's
  `Tabs.ListContainer` horizontal scroll; they never wrap to a second row.
- **Labels:** Image, X, Facebook, LinkedIn, Slack, Discord, WhatsApp, Reddit,
  Tags — the platform's own name, no icons. Tags is chrome, last in the strip.
- **Issue count:** when `evaluateChecks` returns items, a one-line ghost
  control above the strip (`3 issues`) selects the Tags tab. The count is
  chrome, not a badge on the tab label.
- **Selected:** HeroUI's default (primary) `Tabs.Indicator` — a full-height white
  pill (`--segment`) with a `calc(var(--radius) * 3)` corner, carrying
  `--surface-shadow`, sliding between tabs over 250ms. The track behind it is
  `--default`. This is the shipped treatment and is what `preview-tabs.tsx`
  renders today; the accent-underline alternative is HeroUI's `secondary`
  variant, which this project does not use.
- **Focus:** 2px ring, offset 2px, in Signal Blue
- **Default:** the Image tab. It shows the resolved fallback (`og:image`, then
  `twitter:image`). X, Facebook, LinkedIn, Slack, WhatsApp, and Reddit derive
  from that same fallback. Discord does not — it uses `og:image` only.

### Preview Frame (signature component)

The letterbox that holds the standalone `og:image`.

- **Shape:** 16px radius, `overflow: hidden`
- **Background:** Frame Grey
- **Aspect:** locked at 1.91:1 — reserved before load, never collapsed
- **Fit:** `object-contain` here, so the image is judged whole and undistorted.
  Inside the platform cards it switches to `object-cover`, because that is what
  those platforms do to it. **The difference is the point:** the Image tab shows
  what you made, the platform tabs show what survives.

### Platform Cards

- **Character:** transcriptions, not components. Each is a fixed reproduction of
  one platform's card at share time.
- **Rules:** hardcoded hex only; no theme tokens; no shared abstraction across
  the cards. They look similar today and will diverge whenever a platform changes
  its card — a shared base component would fight that. **Discord's left bar is
  the exception:** it uses the page `theme-color` (falling back to `#202225`)
  because Discord does. Every other card colour stays a literal hex.
- **X:** `twitter:card` `summary_large_image` and `player` use the large overlay;
  missing or `summary` is the small square-thumbnail card. `player` is an
  approximation — Tags names that this popup draws the image card, not the video
  player. Drawing the large card when `twitter:card` is absent is a correctness
  bug.
- **Discord:** dark embed, `theme-color` left bar (default `#202225`),
  `og:image` only — never `twitter:image`. Large image vs right thumbnail
  follows `twitter:card` and image aspect.
- **WhatsApp:** compact light card, 72px thumb, two-line title, one-line
  description. HTTP and tiny images are named in Tags, not smoothed in the card.
- **Reddit:** new-Reddit wide 1.91:1 card, center crop. Old Reddit's square crop
  is named in Tags, not drawn as a second specimen.
- **States:** image failures are tracked per URL. A broken `twitter:image` must
  not hide a working `og:image` on Facebook, LinkedIn, Slack, WhatsApp, Reddit,
  or Discord, and the reverse must not hide a working X image. Tags names each
  failed tag separately.

### Tags (chrome)

App chrome, not a platform card. A flat list of checks (no accordion), then a
raw tag table (property, value, copy), then a one-line note that Facebook,
LinkedIn, Reddit, and WhatsApp cache the first scrape. Empty copy: `No issues
in the tags this popup can see.` Issue copy names the tag or URL at fault.

### Empty States

Three, all built on the same HeroUI `EmptyState` at size `sm`, centred in the
frame the image would have occupied:

- **No og:image** — the document has no Open Graph or Twitter image tag
- **Image failed to load** — the tag exists, the URL did not return an image
- **Restricted page** / **Preview unavailable** — the tab cannot be read

- **Media:** a single line icon, never illustration, never colour
- **Copy:** title states the condition, description names the specific tag or URL
  at fault
- **No action button.** There is nothing for the user to do in the popup; the fix
  is in their HTML.

**These are the most important components in the product.** Roughly speaking, a
user who opens this popup and sees a correct card has learned little; a user who
sees an empty state has learned exactly what to fix. They get the same craft as
the success path.

## Do's and Don'ts

### Do:

- **Do** write chrome colours as HeroUI tokens (`bg-background`,
  `text-foreground`, `bg-surface-secondary`) and card colours as literal hex,
  except Discord's `theme-color` bar.
- **Do** reserve the 1.91:1 box before the image loads on Image, X large,
  Facebook, LinkedIn, and Reddit. Slack, WhatsApp, and X summary keep a square
  thumbnail. Discord follows `twitter:card` / aspect.
- **Do** keep `object-contain` on the Image tab and `object-cover` in the
  platform cards that crop. Discord's large image is `object-contain` because
  Discord scales to fit rather than center-cropping. That mismatch is
  information.
- **Do** name the specific tag or URL at fault in failure copy.
- **Do** hold the chrome to WCAG 2.2 AA, and hold card *structure* — alt text,
  semantics, keyboard reach, focus order — to AA as well.
- **Do** keep the `--muted` override in `style.css`. HeroUI's stock value
  (`#71717a`) measures 4.43:1 on Paper and 4.20:1 on Frame Grey, under the 4.5:1
  body minimum; the override clears both. Do not revert to the stock token.
- **Do** treat a platform's ugly choice as correct inside its own card.

### Don't:

- **Don't** hand-author a `box-shadow` in `entrypoints/popup/`. HeroUI's own
  component shadows are inherited and exempt.
- **Don't** apply theme tokens, dark mode, or house radii to the platform cards.
- **Don't** invert the cards in dark mode; the chrome inverts, the specimens
  keep the colours those platforms actually render. Discord stays dark.
- **Don't** use `border-left` or `border-right` above 1px as an accent —
  `SlackPreview`'s 4px bar and `DiscordPreview`'s `theme-color` bar are the
  permitted instances, because those platforms draw them.
- **Don't** put chrome text below 13px to win space at 420px.
- **Don't** introduce a second accent colour, or use Signal Blue for anything but
  focus and selection.
- **Don't** abstract the platform cards into a shared configurable
  component. They are transcriptions that happen to rhyme.
- **Don't** wrap the tab strip onto two rows, or add a second navigation layer
  to reach Discord, WhatsApp, Reddit, or Tags.
- **Don't** draw fake browser chrome, phone bezels, or app sidebars around a
  preview. The card is the subject.
- **Don't** add empty-state action buttons; the fix lives in the user's HTML.
