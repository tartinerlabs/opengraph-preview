import type { OpenGraphTags } from "./extract-open-graph.ts";

export const CHECK_IDS = [
  "missing-og-title",
  "missing-og-description",
  "missing-og-image",
  "title-length",
  "description-length",
  "twitter-card",
  "relative-image",
  "http-image",
  "image-broken",
  "twitter-image-broken",
  "crawler-invisible",
  "image-format",
  "multiple-og-image",
  "og-url-relative",
  "og-url-canonical",
  "missing-image-alt",
  "image-dimension-mismatch",
  "image-too-small",
  "image-aspect",
  "image-file-size",
] as const;

export type CheckId = (typeof CHECK_IDS)[number];

export type Check = {
  id: CheckId;
  message: string;
};

export type ImageMeta = {
  brokenImageUrls?: ReadonlySet<string>;
  naturalHeight: number | null;
  naturalWidth: number | null;
};

const TARGET_ASPECT = 1.91;
const ASPECT_TOLERANCE = 0.2;
const MIN_IMAGE_PX = 200;
export const FACEBOOK_MAX_BYTES = 8 * 1024 * 1024;
const WHATSAPP_MAX_BYTES = 600 * 1024;
// X card markup docs: twitter:title max 70, twitter:description max 200.
const X_TITLE_MAX_CHARS = 70;
const X_DESCRIPTION_MAX_CHARS = 200;

export function isRelativeImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) {
    return false;
  }
  return true;
}

export function isHttpOnPublicHost(value: string): boolean {
  const trimmed = value.trim();
  if (!/^http:\/\//i.test(trimmed)) {
    return false;
  }

  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    return (
      host !== "localhost" &&
      host !== "127.0.0.1" &&
      host !== "[::1]" &&
      !host.endsWith(".localhost")
    );
  } catch {
    return false;
  }
}

export function evaluateChecks(
  tags: OpenGraphTags,
  imageMeta: ImageMeta = { naturalHeight: null, naturalWidth: null },
): Check[] {
  const checks: Check[] = [];

  if (!tags.ogTitle) {
    if (tags.twitterTitle) {
      checks.push({
        id: "missing-og-title",
        message: "og:title is missing. Previews use twitter:title.",
      });
    } else if (tags.title) {
      checks.push({
        id: "missing-og-title",
        message: "og:title is missing. Previews use the document title.",
      });
    } else {
      checks.push({
        id: "missing-og-title",
        message: "og:title is missing.",
      });
    }
  }

  if (!tags.ogDescription) {
    if (tags.twitterDescription) {
      checks.push({
        id: "missing-og-description",
        message: "og:description is missing. Previews use twitter:description.",
      });
    } else if (tags.description) {
      checks.push({
        id: "missing-og-description",
        message:
          "og:description is missing. Previews use the meta description.",
      });
    } else {
      checks.push({
        id: "missing-og-description",
        message: "og:description is missing.",
      });
    }
  }

  if (!tags.ogImageRaw) {
    if (tags.twitterImageRaw) {
      checks.push({
        id: "missing-og-image",
        message:
          "og:image is missing. Previews use twitter:image. Discord ignores twitter:image.",
      });
    } else {
      checks.push({
        id: "missing-og-image",
        message: "og:image is missing.",
      });
    }
  }

  const xTitle = tags.twitterTitle
    ? { name: "twitter:title", value: tags.twitterTitle }
    : tags.ogTitle
      ? { name: "og:title", value: tags.ogTitle }
      : { name: "The document title", value: tags.title };
  const xTitleLength = countCharacters(xTitle.value);
  if (xTitleLength > X_TITLE_MAX_CHARS) {
    checks.push({
      id: "title-length",
      message: `${xTitle.name} is ${xTitleLength} characters. X card markup allows at most ${X_TITLE_MAX_CHARS}.`,
    });
  }

  const xDescription = tags.twitterDescription
    ? { name: "twitter:description", value: tags.twitterDescription }
    : tags.ogDescription
      ? { name: "og:description", value: tags.ogDescription }
      : { name: "The meta description", value: tags.description };
  const xDescriptionLength = countCharacters(xDescription.value);
  const xDrawsDescription =
    tags.twitterCard.trim().toLowerCase() !== "summary_large_image";
  if (xDrawsDescription && xDescriptionLength > X_DESCRIPTION_MAX_CHARS) {
    checks.push({
      id: "description-length",
      message: `${xDescription.name} is ${xDescriptionLength} characters. X card markup allows at most ${X_DESCRIPTION_MAX_CHARS}.`,
    });
  }

  const card = tags.twitterCard.trim().toLowerCase();
  if (card === "player") {
    checks.push({
      id: "twitter-card",
      message:
        "twitter:card is player. This popup draws the large image card, not the video player.",
    });
  } else if (card !== "summary_large_image") {
    if (!card) {
      checks.push({
        id: "twitter-card",
        message: "twitter:card is missing. X will draw a small summary card.",
      });
    } else {
      checks.push({
        id: "twitter-card",
        message: `twitter:card is ${tags.twitterCard.trim()}. X will not draw the large card.`,
      });
    }
  }

  const primaryRaw = tags.ogImageRaw || tags.twitterImageRaw;
  const primaryTag = tags.ogImageRaw ? "og:image" : "twitter:image";
  const resolvedImage = tags.ogImage || tags.twitterImage;

  const imageScheme = /^([a-z][a-z\d+.-]*):/i.exec(primaryRaw.trim())?.[1];
  if (imageScheme && !/^https?$/i.test(imageScheme)) {
    checks.push({
      id: "relative-image",
      message: `${primaryTag} is a ${imageScheme.toLowerCase()}: URL. Crawlers only fetch http(s) images.`,
    });
  } else if (primaryRaw && isRelativeImageUrl(primaryRaw)) {
    checks.push({
      id: "relative-image",
      message: `${primaryTag} is a relative URL (${primaryRaw}). Crawlers will not resolve it.`,
    });
  }

  const httpImage =
    (primaryRaw && isHttpOnPublicHost(primaryRaw) && primaryRaw) ||
    (resolvedImage && isHttpOnPublicHost(resolvedImage) && resolvedImage);
  if (httpImage) {
    checks.push({
      id: "http-image",
      message: `${primaryTag} uses ${httpImage}. WhatsApp and Discord require https.`,
    });
  }

  const brokenImageUrls = imageMeta.brokenImageUrls;
  if (tags.ogImage && brokenImageUrls?.has(tags.ogImage)) {
    checks.push({
      id: "image-broken",
      message: "The og:image URL did not return an image.",
    });
  }
  if (
    tags.twitterImage &&
    tags.twitterImage !== tags.ogImage &&
    brokenImageUrls?.has(tags.twitterImage)
  ) {
    checks.push({
      id: "twitter-image-broken",
      message: "The twitter:image URL did not return an image.",
    });
  }

  if (tags.crawlerInvisibleTags.length > 0) {
    const named = joinNames(tags.crawlerInvisibleTags);
    const verb = tags.crawlerInvisibleTags.length === 1 ? "is" : "are";
    checks.push({
      id: "crawler-invisible",
      message: `${named} ${verb} present in the live DOM but missing from the HTML source. Crawlers will not see ${tags.crawlerInvisibleTags.length === 1 ? "this tag" : "these tags"}.`,
    });
  }

  if (primaryRaw && isSvgImage(primaryRaw, tags.imageContentType)) {
    checks.push({
      id: "image-format",
      message: `${primaryTag} is an SVG (${primaryRaw}). Social platforms do not render SVG og:image.`,
    });
  }

  if (tags.ogImageCount > 1) {
    checks.push({
      id: "multiple-og-image",
      message: `og:image is declared ${tags.ogImageCount} times. Platforms use the first og:image (${tags.ogImageRaw}).`,
    });
  }

  const ogUrl = tags.ogUrl.trim();
  const canonicalUrl = tags.canonicalUrl.trim();
  if (ogUrl && !isAbsoluteHttpUrl(ogUrl)) {
    checks.push({
      id: "og-url-relative",
      message: `og:url is not an absolute http(s) URL (${ogUrl}). Crawlers will not resolve it.`,
    });
  } else if (
    ogUrl &&
    isAbsoluteHttpUrl(canonicalUrl) &&
    normalizePageUrl(ogUrl) !== normalizePageUrl(canonicalUrl)
  ) {
    checks.push({
      id: "og-url-canonical",
      message: `og:url is ${ogUrl} but link rel="canonical" is ${canonicalUrl}. Shares may be counted against different URLs.`,
    });
  }

  if (primaryRaw && !tags.ogImageAlt && !tags.twitterImageAlt) {
    checks.push({
      id: "missing-image-alt",
      message:
        "og:image:alt and twitter:image:alt are missing. The preview image has no alt text.",
    });
  }

  const declaredWidth = parsePositiveInt(tags.ogImageWidth);
  const declaredHeight = parsePositiveInt(tags.ogImageHeight);
  if (
    primaryRaw &&
    declaredWidth !== null &&
    declaredHeight !== null &&
    imageMeta.naturalWidth !== null &&
    imageMeta.naturalHeight !== null &&
    (declaredWidth !== imageMeta.naturalWidth ||
      declaredHeight !== imageMeta.naturalHeight)
  ) {
    checks.push({
      id: "image-dimension-mismatch",
      message: `og:image:width and og:image:height declare ${declaredWidth}×${declaredHeight}, but ${primaryTag} is ${imageMeta.naturalWidth}×${imageMeta.naturalHeight}.`,
    });
  }

  const width = imageMeta.naturalWidth ?? parsePositiveInt(tags.ogImageWidth);
  const height =
    imageMeta.naturalHeight ?? parsePositiveInt(tags.ogImageHeight);

  if (primaryRaw && width !== null && height !== null) {
    if (width < MIN_IMAGE_PX || height < MIN_IMAGE_PX) {
      checks.push({
        id: "image-too-small",
        message: `${primaryTag} is ${width}×${height}, under ${MIN_IMAGE_PX}px. Platforms may ignore it.`,
      });
    }

    const ratio = width / height;
    if (Math.abs(ratio - TARGET_ASPECT) / TARGET_ASPECT > ASPECT_TOLERANCE) {
      checks.push({
        id: "image-aspect",
        message: `${primaryTag} is ${formatAspect(width, height)}. Platforms crop toward 1.91:1. Old Reddit square-crops.`,
      });
    }
  }

  const bytes = tags.imageFileSizeBytes;
  if (primaryRaw && bytes !== null && bytes > FACEBOOK_MAX_BYTES) {
    checks.push({
      id: "image-file-size",
      message: `${primaryTag} is ${formatBytes(bytes)}. Facebook rejects images over 8 MB.`,
    });
  } else if (primaryRaw && bytes !== null && bytes > WHATSAPP_MAX_BYTES) {
    checks.push({
      id: "image-file-size",
      message: `${primaryTag} is ${formatBytes(bytes)}. WhatsApp expects images under 600 KB.`,
    });
  }

  return checks;
}

/** Splits a check message at its first sentence: the lead states the fault, the detail explains it. */
export function splitCheckMessage(message: string): {
  detail: string;
  lead: string;
} {
  const index = message.indexOf(". ");
  if (index === -1) {
    return { detail: "", lead: message };
  }
  return {
    detail: message.slice(index + 2),
    lead: message.slice(0, index + 1),
  };
}

/**
 * What previews draw instead of a tag that is not set. Only fallbacks the
 * checks above and the platform cards already encode; null when none applies.
 */
export function fallbackNote(tag: string, tags: OpenGraphTags): string | null {
  switch (tag) {
    case "og:title":
      if (tags.twitterTitle) {
        return "Previews use twitter:title.";
      }
      return tags.title ? "Previews use the document title." : null;
    case "og:description":
      if (tags.twitterDescription) {
        return "Previews use twitter:description.";
      }
      return tags.description ? "Previews use the meta description." : null;
    case "og:image":
      return tags.twitterImageRaw
        ? "Previews use twitter:image. Discord ignores twitter:image."
        : null;
    case "twitter:card":
      return "X draws a small summary card.";
    case "twitter:title":
      if (tags.ogTitle) {
        return "X uses og:title.";
      }
      return tags.title ? "X uses the document title." : null;
    case "twitter:description":
      if (tags.ogDescription) {
        return "X uses og:description.";
      }
      return tags.description ? "X uses the meta description." : null;
    case "twitter:image":
      return tags.ogImageRaw ? "X uses og:image." : null;
    case "theme-color":
      return "Discord uses #202225.";
    default:
      return null;
  }
}

function countCharacters(value: string): number {
  return Array.from(value.trim()).length;
}

function isSvgImage(raw: string, contentType: string | null): boolean {
  if (contentType?.toLowerCase().startsWith("image/svg+xml")) {
    return true;
  }
  try {
    return new URL(raw.trim(), "https://base.invalid/").pathname
      .toLowerCase()
      .endsWith(".svg");
  } catch {
    return false;
  }
}

function isAbsoluteHttpUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) {
    return false;
  }
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function normalizePageUrl(value: string): string {
  const parsed = new URL(value);
  parsed.hash = "";
  if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }
  return parsed.href;
}

function parsePositiveInt(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function joinNames(names: string[]): string {
  const first = names[0] ?? "";
  const last = names[names.length - 1] ?? "";
  if (names.length === 1) {
    return first;
  }
  if (names.length === 2) {
    return `${first} and ${last}`;
  }
  return `${names.slice(0, -1).join(", ")}, and ${last}`;
}

function formatAspect(width: number, height: number): string {
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.02) {
    return "1:1";
  }
  if (Math.abs(ratio - 16 / 9) < 0.03) {
    return "16:9";
  }
  if (Math.abs(ratio - TARGET_ASPECT) < 0.03) {
    return "1.91:1";
  }
  return `${ratio.toFixed(2)}:1`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    const rounded = mb >= 10 ? mb.toFixed(0) : mb.toFixed(1);
    return `${rounded} MB`;
  }
  const kb = bytes / 1024;
  const rounded = kb >= 10 ? kb.toFixed(0) : kb.toFixed(1);
  return `${rounded} KB`;
}
