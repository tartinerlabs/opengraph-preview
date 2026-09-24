import {
  type Check,
  type CheckId,
  FACEBOOK_MAX_BYTES,
} from "./evaluate-checks.ts";
import type { OpenGraphTags } from "./extract-open-graph.ts";

/**
 * Which platform tabs each check belongs to. Drives the tab issue dots and the
 * related-issue line under each card.
 *
 * Rule: a check maps to a platform when it changes what that platform's card
 * in this popup draws (fallback text, fallback or missing image, card variant,
 * length limit) or its message names that platform. CHECK_PLATFORMS holds the
 * platforms that hold on every page where the check fires; checksForPlatform
 * adds the ones that depend on which tags are present.
 */
export const PLATFORM_IDS = [
  "image",
  "x",
  "facebook",
  "linkedin",
  "slack",
  "discord",
  "whatsapp",
  "reddit",
] as const;

export type PlatformId = (typeof PLATFORM_IDS)[number];

// Cards that read the merged og-first title and description.
const OG_TEXT_CARDS = [
  "facebook",
  "linkedin",
  "slack",
  "discord",
  "whatsapp",
] as const;

// Cards that draw the og-first image (Discord reads og:image only).
const OG_IMAGE_CARDS = [
  "image",
  "facebook",
  "linkedin",
  "slack",
  "discord",
  "whatsapp",
  "reddit",
] as const;

// Record<CheckId, ...> makes a new check id a compile error until it is mapped.
export const CHECK_PLATFORMS: Record<CheckId, readonly PlatformId[]> = {
  // X reads twitter:title and twitter:description first.
  "missing-og-title": [...OG_TEXT_CARDS, "reddit"],
  // Reddit draws no description.
  "missing-og-description": OG_TEXT_CARDS,
  // X reads twitter:image first; checksForPlatform adds X when it has none.
  "missing-og-image": OG_IMAGE_CARDS,
  "title-length": ["x"],
  "description-length": ["x"],
  // All three pick their card variant from twitter:card.
  "twitter-card": ["x", "slack", "discord"],
  // Named in the message.
  "http-image": ["discord", "whatsapp"],
  // Plus any other card that draws the broken URL (see checksForPlatform).
  "image-broken": OG_IMAGE_CARDS,
  "twitter-image-broken": ["x"],
  // "Old Reddit square-crops."
  "image-aspect": ["reddit"],
  // Both branches exceed WhatsApp's 600 KB. Facebook is added above 8 MB.
  "image-file-size": ["whatsapp"],
  // The popup resolves relative URLs against the tab, so no card here changes.
  "relative-image": [],
  "crawler-invisible": [],
  "image-format": [],
  "multiple-og-image": [],
  "og-url-relative": [],
  "og-url-canonical": [],
  "missing-image-alt": [],
  "image-dimension-mismatch": [],
  "image-too-small": [],
};

type PlatformTags = Pick<
  OpenGraphTags,
  "image" | "imageFileSizeBytes" | "ogImage" | "twitterImage"
>;

// Platforms a check reaches only for some tag combinations.
function dependsOnTags(
  id: CheckId,
  platform: PlatformId,
  tags: PlatformTags,
): boolean {
  const drawn = platformImage(platform, tags);
  switch (id) {
    case "missing-og-image":
      return !drawn;
    case "image-broken":
      return drawn === tags.ogImage;
    case "twitter-image-broken":
      return drawn === tags.twitterImage;
    case "image-file-size":
      return (
        platform === "facebook" &&
        (tags.imageFileSizeBytes ?? 0) > FACEBOOK_MAX_BYTES
      );
    default:
      return false;
  }
}

export function checksForPlatform(
  checks: readonly Check[],
  platform: PlatformId,
  tags: PlatformTags,
): Check[] {
  return checks.filter(
    (check) =>
      CHECK_PLATFORMS[check.id].includes(platform) ||
      dependsOnTags(check.id, platform, tags),
  );
}

/** The image URL each card draws: X prefers twitter:image, Discord reads og:image only. */
export function platformImage(
  platform: PlatformId,
  tags: Pick<OpenGraphTags, "image" | "ogImage" | "twitterImage">,
): string {
  if (platform === "x") {
    return tags.twitterImage || tags.image;
  }
  if (platform === "discord") {
    return tags.ogImage;
  }
  return tags.image;
}
