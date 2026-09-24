import { describe, expect, it } from "vitest";
import {
  CHECK_PLATFORMS,
  checksForPlatform,
  PLATFORM_IDS,
  platformImage,
} from "./check-platforms.ts";
import { CHECK_IDS, evaluateChecks } from "./evaluate-checks.ts";
import type { OpenGraphTags } from "./extract-open-graph.ts";

const tags: OpenGraphTags = {
  canonicalUrl: "https://example.com/coffee",
  crawlerInvisibleTags: [],
  description: "A page about coffee.",
  faviconUrl: "https://example.com/favicon.ico",
  image: "https://example.com/og.png",
  imageContentType: null,
  imageFileSizeBytes: null,
  ogDescription: "A page about coffee.",
  ogImage: "https://example.com/og.png",
  ogImageAlt: "A cup of coffee",
  ogImageCount: 1,
  ogImageHeight: "630",
  ogImageRaw: "https://example.com/og.png",
  ogImageWidth: "1200",
  ogSiteName: "Example",
  ogTitle: "Coffee",
  ogUrl: "https://example.com/coffee",
  siteName: "Example",
  themeColor: "#111111",
  title: "Coffee",
  twitterCard: "summary_large_image",
  twitterDescription: "A page about coffee.",
  twitterImage: "https://example.com/og.png",
  twitterImageAlt: "",
  twitterImageRaw: "https://example.com/og.png",
  twitterTitle: "Coffee",
  url: "https://example.com/coffee",
};

const noMeta = { naturalHeight: null, naturalWidth: null };

function ids(checks: { id: string }[]): string[] {
  return checks.map((check) => check.id);
}

describe("CHECK_PLATFORMS", () => {
  it("should map every check id exactly once", () => {
    expect(Object.keys(CHECK_PLATFORMS).sort()).toEqual([...CHECK_IDS].sort());
  });

  it("should only name known platforms, without duplicates", () => {
    for (const platforms of Object.values(CHECK_PLATFORMS)) {
      for (const platform of platforms) {
        expect(PLATFORM_IDS).toContain(platform);
      }
      expect(new Set(platforms).size).toBe(platforms.length);
    }
  });

  it("should only see check ids that are in CHECK_IDS", () => {
    const empty: OpenGraphTags = {
      ...tags,
      canonicalUrl: "",
      description: "",
      image: "",
      ogDescription: "",
      ogImage: "",
      ogImageHeight: "",
      ogImageRaw: "",
      ogImageWidth: "",
      ogTitle: "",
      ogUrl: "",
      themeColor: "",
      title: "",
      twitterCard: "",
      twitterDescription: "",
      twitterImage: "",
      twitterImageRaw: "",
      twitterTitle: "",
    };
    const wrong: OpenGraphTags = {
      ...tags,
      canonicalUrl: "https://example.com/other",
      crawlerInvisibleTags: ["og:image"],
      imageFileSizeBytes: 9 * 1024 * 1024,
      ogImage: "http://example.com/og.svg",
      ogImageAlt: "",
      ogImageCount: 2,
      ogImageRaw: "http://example.com/og.svg",
      ogTitle: "x".repeat(80),
      twitterCard: "summary",
      twitterDescription: "y".repeat(210),
      twitterImage: "https://example.com/tw.png",
      twitterTitle: "",
    };
    const seen = [
      ...evaluateChecks(empty),
      ...evaluateChecks(wrong, {
        brokenImageUrls: new Set([wrong.ogImage, wrong.twitterImage]),
        naturalHeight: 100,
        naturalWidth: 100,
      }),
    ];
    expect(seen.length).toBeGreaterThan(0);
    for (const check of seen) {
      expect(CHECK_IDS).toContain(check.id);
    }
  });
});

describe("checksForPlatform", () => {
  const checks = evaluateChecks(
    { ...tags, ogDescription: "", twitterCard: "", twitterDescription: "x" },
    { naturalHeight: 900, naturalWidth: 1200 },
  );

  it("should give X only the checks that change its card", () => {
    expect(ids(checksForPlatform(checks, "x", tags))).toEqual(["twitter-card"]);
  });

  it("should give Slack the description fallback and the card variant", () => {
    expect(ids(checksForPlatform(checks, "slack", tags))).toEqual([
      "missing-og-description",
      "twitter-card",
    ]);
  });

  it("should give Reddit the aspect check", () => {
    expect(ids(checksForPlatform(checks, "reddit", tags))).toEqual([
      "image-aspect",
    ]);
  });

  it("should give the image tab nothing when only text and crop checks fire", () => {
    expect(ids(checksForPlatform(checks, "image", tags))).toEqual([]);
  });

  it("should not attach page-wide checks to any platform", () => {
    const pageWide = evaluateChecks(
      {
        ...tags,
        canonicalUrl: "https://example.com/other",
        crawlerInvisibleTags: ["og:image"],
        ogImageAlt: "",
        ogImageRaw: "/og.png",
        twitterImageAlt: "",
      },
      noMeta,
    );
    expect(ids(pageWide)).toEqual(
      expect.arrayContaining([
        "og-url-canonical",
        "missing-image-alt",
        "crawler-invisible",
        "relative-image",
      ]),
    );
    for (const platform of PLATFORM_IDS) {
      expect(checksForPlatform(pageWide, platform, tags)).toEqual([]);
    }
  });

  function platformsWith(pageTags: OpenGraphTags, broken: string[] = []) {
    const pageChecks = evaluateChecks(pageTags, {
      ...noMeta,
      brokenImageUrls: new Set(broken),
    });
    return PLATFORM_IDS.filter(
      (platform) =>
        checksForPlatform(pageChecks, platform, pageTags).length > 0,
    );
  }

  it("should attach image-file-size to WhatsApp under 8 MB", () => {
    expect(platformsWith({ ...tags, imageFileSizeBytes: 742 * 1024 })).toEqual([
      "whatsapp",
    ]);
  });

  it("should add Facebook to image-file-size over 8 MB", () => {
    expect(
      platformsWith({ ...tags, imageFileSizeBytes: 9 * 1024 * 1024 }),
    ).toEqual(["facebook", "whatsapp"]);
  });

  it("should mark X when a broken og:image is also its twitter:image", () => {
    expect(platformsWith(tags, [tags.ogImage])).toEqual([...PLATFORM_IDS]);
  });

  it("should mark X when a broken og:image is its only image", () => {
    const pageTags = { ...tags, twitterImage: "", twitterImageRaw: "" };
    expect(platformsWith(pageTags, [tags.ogImage])).toEqual([...PLATFORM_IDS]);
  });

  it("should not mark X when only a distinct og:image is broken", () => {
    const pageTags = {
      ...tags,
      twitterImage: "https://example.com/tw.png",
      twitterImageRaw: "https://example.com/tw.png",
    };
    expect(platformsWith(pageTags, [tags.ogImage])).not.toContain("x");
  });

  it("should mark X only when a distinct twitter:image is broken", () => {
    const pageTags = {
      ...tags,
      twitterImage: "https://example.com/tw.png",
      twitterImageRaw: "https://example.com/tw.png",
    };
    expect(platformsWith(pageTags, ["https://example.com/tw.png"])).toEqual([
      "x",
    ]);
  });

  it("should mark every card that falls back to a broken twitter-only image", () => {
    const tw = "https://example.com/tw.png";
    const pageTags = {
      ...tags,
      image: tw,
      ogImage: "",
      ogImageRaw: "",
      twitterImage: tw,
      twitterImageRaw: tw,
    };
    const pageChecks = evaluateChecks(pageTags, {
      ...noMeta,
      brokenImageUrls: new Set([tw]),
    });
    const broken = PLATFORM_IDS.filter((platform) =>
      ids(checksForPlatform(pageChecks, platform, pageTags)).includes(
        "twitter-image-broken",
      ),
    );
    expect(broken).toEqual(PLATFORM_IDS.filter((id) => id !== "discord"));
  });

  it("should mark X for missing-og-image only when it has no image either", () => {
    const noImage = {
      ...tags,
      image: "",
      ogImage: "",
      ogImageRaw: "",
      twitterImage: "",
      twitterImageRaw: "",
    };
    expect(platformsWith(noImage)).toContain("x");
    const twitterOnly = {
      ...noImage,
      image: "https://example.com/tw.png",
      twitterImage: "https://example.com/tw.png",
      twitterImageRaw: "https://example.com/tw.png",
    };
    expect(platformsWith(twitterOnly)).not.toContain("x");
  });
});

describe("platformImage", () => {
  const images = {
    image: "https://example.com/tw.png",
    ogImage: "",
    twitterImage: "https://example.com/tw.png",
  };

  it("should prefer twitter:image on X, then the merged image", () => {
    expect(platformImage("x", images)).toBe("https://example.com/tw.png");
    expect(platformImage("x", { ...images, twitterImage: "" })).toBe(
      "https://example.com/tw.png",
    );
  });

  it("should use og:image only on Discord", () => {
    expect(platformImage("discord", images)).toBe("");
  });

  it("should use the merged image on the other cards", () => {
    expect(platformImage("facebook", images)).toBe(
      "https://example.com/tw.png",
    );
    expect(platformImage("image", images)).toBe("https://example.com/tw.png");
  });
});
