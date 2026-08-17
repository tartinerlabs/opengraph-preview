# Product

## Register

product

## Users

Developers and the people who work alongside them, in the seconds before or after
something ships:

- **Solo devs on localhost** building a Next.js route who want to see the
  `opengraph-image` output before deploying. This is the reason the extension
  exists — hosted tools like metatags.io cannot reach `localhost`.
- **Devs verifying production pages** after a deploy, confirming the card still
  renders correctly across platforms.
- **Marketing and content people** checking how a post will look when shared,
  without needing to read HTML.
- **Anyone debugging a broken card** — something looked wrong when shared, and
  they need to find out which tag is missing or which image 404s.

The shared context is a short, interruptive one: the popup is opened mid-task,
consulted for a few seconds, and dismissed. Nobody is here to browse.

## Product Purpose

Read the current tab's Open Graph tags and show, faithfully, what the resulting
card looks like: the standalone `og:image` plus the way X, Facebook, LinkedIn,
Slack, Discord, WhatsApp, and Reddit would render it — and whether those cards
will actually ship.

Success is a confident ship / no-ship decision made inside the popup, without
opening any of those platforms to check. That includes "this card will be
small", "crawlers will miss these tags", and "this image is the wrong shape",
not only "the picture looks fine here". That makes **fidelity the product**.
A preview that is prettier than reality is a bug, because it produces a wrong
decision. The same applies to failures: an image tag that is absent everywhere,
or a URL that 404s, must be stated plainly rather than smoothed over.

Note the extraction contract this rests on. `og:image` is not the only source —
`readOpenGraphFromDocument` falls back to `twitter:image`, and does the same for
title and description, so a page carrying only Twitter tags still previews on
X, Facebook, LinkedIn, and Slack. Discord, WhatsApp, and Reddit read `og:image`
only. The Image tab empty state still means **no Open Graph and no Twitter
image tag**. The Tags tab names the fallback when one was used, and names tags
present in the live DOM but missing from the HTML source, because crawlers do
not run JavaScript.

## Brand Personality

**Precise, honest, quiet.**

An instrument, not a product. It reports what is there, admits what is not, and
gets out of the way. Voice is flat and specific — "This document has no Open
Graph or Twitter image tag", not "Oops! Something went wrong." No exclamation
marks, no encouragement, no personality in the copy. The confidence comes from
being exactly right about small things.

## Anti-references

- **A SaaS landing page in a popup.** No gradient headers, hero metrics,
  marketing copy, or upsell. It is a 420px tool.
- **Fake chrome around the previews.** No mock browser window, phone bezel, or
  social-app sidebar drawn around each card. The card is the subject; frames are
  noise that makes the imitation less believable, not more.
- **Styling the previews to match the app.** The platform cards must not adopt
  HeroUI theme tokens. They stay pixel-faithful to X, Facebook, LinkedIn,
  Slack, Discord, WhatsApp, and Reddit even where that means reproducing
  choices we would not make — including Slack's `border-left` accent bar,
  Discord's `theme-color` bar on a dark embed, and low-contrast metadata text.
- **Cramped devtools-panel density.** No 10px text or zero-gutter packing to win
  space at 420px. Quiet is not the same as small.

## Design Principles

1. **Fidelity over taste.** Inside a platform card, the platform's design wins.
   Our judgement applies to the app chrome around it — never to the imitation.
   Deviating to make a card look better is a correctness failure.
2. **Two design systems, one clear border.** App chrome uses HeroUI tokens;
   platform cards use hardcoded third-party values. The boundary between them
   should be legible in the code and visible in the UI, so neither leaks into
   the other.
3. **Failures are information.** A missing tag or a broken image is a real
   answer to the user's question, not an error to apologise for. Empty states
   name the specific tag or URL at fault and are held to the same craft bar as
   the success path.
4. **Consulted, not visited.** The popup is read in seconds, so the path to any
   preview is one deliberate click. The tab strip is that path — Image, the
   platform cards, and Tags — and is the intended way to choose a surface. The
   strip scrolls horizontally when the labels overflow 420px; that is still one
   click, not a second navigation layer. A one-line issue count in the chrome
   (`3 issues`) selects Tags. What this principle rules out is a *second* layer
   of interaction: disclosures, accordions, hover-only content, "show more", or
   wrapping the tabs onto two rows. Within a selected tab, everything is
   visible at once.
5. **The 420px width is the design, not a constraint.** Layouts are composed for
   that width rather than squeezed into it.

## Accessibility & Inclusion

WCAG 2.2 AA for all **app chrome** — tabs, empty states, controls, focus order,
focus visibility, and `prefers-reduced-motion` alternatives for any animation.

**The platform preview cards are explicitly exempt.** They replicate third-party
contrast values, including where those values fail AA (for example X's `#8b98a5`
domain text over a dark gradient, LinkedIn's 60%-opacity black metadata, and
Discord's `#949ba4` site name on `#2b2d31`). Correcting them would defeat the
product's purpose. This exemption is deliberate and scoped: it covers only
colour and type values copied from the platform being imitated. Everything
structural — alt text, semantics, keyboard reachability, image failure
handling — is held to AA inside the cards as well.
