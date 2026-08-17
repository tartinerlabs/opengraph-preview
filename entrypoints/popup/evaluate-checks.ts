import type { OpenGraphTags } from "./extract-open-graph.ts";

export type Check = {
  id: string;
  message: string;
};

export type ImageMeta = {
  imageBroken?: boolean;
  naturalHeight: number | null;
  naturalWidth: number | null;
};

const TARGET_ASPECT = 1.91;
const ASPECT_TOLERANCE = 0.2;
const MIN_IMAGE_PX = 200;
const FACEBOOK_MAX_BYTES = 8 * 1024 * 1024;
const WHATSAPP_MAX_BYTES = 600 * 1024;

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

  const card = tags.twitterCard.trim().toLowerCase();
  if (card !== "summary_large_image") {
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

  if (primaryRaw && isRelativeImageUrl(primaryRaw)) {
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

  if (imageMeta.imageBroken && primaryRaw) {
    checks.push({
      id: "image-broken",
      message: `The ${primaryTag} URL did not return an image.`,
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
