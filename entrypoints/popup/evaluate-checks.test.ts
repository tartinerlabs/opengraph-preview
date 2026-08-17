import { describe, expect, it } from "vitest";
import {
  evaluateChecks,
  isHttpOnPublicHost,
  isRelativeImageUrl,
} from "./evaluate-checks.ts";
import type { OpenGraphTags } from "./extract-open-graph.ts";

const completeTags: OpenGraphTags = {
  crawlerInvisibleTags: [],
  description: "A page about coffee.",
  image: "https://example.com/og.png",
  imageFileSizeBytes: null,
  ogDescription: "A page about coffee.",
  ogImage: "https://example.com/og.png",
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
  twitterImageRaw: "https://example.com/og.png",
  twitterTitle: "Coffee",
  url: "https://example.com/coffee",
};

describe("isRelativeImageUrl", () => {
  it("should treat path and root-relative URLs as relative", () => {
    expect(isRelativeImageUrl("/opengraph-image")).toBe(true);
    expect(isRelativeImageUrl("opengraph-image.png")).toBe(true);
    expect(isRelativeImageUrl("../img.png")).toBe(true);
  });

  it("should not treat absolute or protocol-relative URLs as relative", () => {
    expect(isRelativeImageUrl("https://example.com/og.png")).toBe(false);
    expect(isRelativeImageUrl("http://example.com/og.png")).toBe(false);
    expect(isRelativeImageUrl("//cdn.example.com/og.png")).toBe(false);
    expect(isRelativeImageUrl("")).toBe(false);
  });
});

describe("isHttpOnPublicHost", () => {
  it("should flag http images on a public host", () => {
    expect(isHttpOnPublicHost("http://example.com/og.png")).toBe(true);
  });

  it("should allow http on localhost and ignore https", () => {
    expect(isHttpOnPublicHost("http://localhost:3000/og.png")).toBe(false);
    expect(isHttpOnPublicHost("http://127.0.0.1/og.png")).toBe(false);
    expect(isHttpOnPublicHost("https://example.com/og.png")).toBe(false);
    expect(isHttpOnPublicHost("/opengraph-image")).toBe(false);
  });
});

describe("evaluateChecks", () => {
  it("should return no checks when tags and image look complete", () => {
    expect(
      evaluateChecks(completeTags, {
        naturalHeight: 630,
        naturalWidth: 1200,
      }),
    ).toEqual([]);
  });

  it("should name a missing og:title and state the Twitter fallback", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        ogTitle: "",
        title: "twitter title",
        twitterTitle: "twitter title",
      }).map((check) => check.message),
    ).toContain("og:title is missing. Previews use twitter:title.");
  });

  it("should name a missing og:title and state the document title fallback", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        ogTitle: "",
        title: "Document title",
        twitterTitle: "",
      }).map((check) => check.message),
    ).toContain("og:title is missing. Previews use the document title.");
  });

  it("should name a missing og:description and state the Twitter fallback", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        description: "twitter description",
        ogDescription: "",
        twitterDescription: "twitter description",
      }).map((check) => check.message),
    ).toContain("og:description is missing. Previews use twitter:description.");
  });

  it("should name a missing og:image and state that Discord ignores twitter:image", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        ogImage: "",
        ogImageRaw: "",
        twitterImageRaw: "https://example.com/twitter.png",
      }).map((check) => check.message),
    ).toContain(
      "og:image is missing. Previews use twitter:image. Discord ignores twitter:image.",
    );
  });

  it("should name a missing og:image when no Twitter fallback exists", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        image: "",
        ogImage: "",
        ogImageRaw: "",
        twitterImage: "",
        twitterImageRaw: "",
      }).map((check) => check.message),
    ).toContain("og:image is missing.");
  });

  it("should warn when twitter:card is missing", () => {
    expect(
      evaluateChecks({ ...completeTags, twitterCard: "" }).map(
        (check) => check.message,
      ),
    ).toContain("twitter:card is missing. X will draw a small summary card.");
  });

  it("should warn when twitter:card is summary", () => {
    expect(
      evaluateChecks({ ...completeTags, twitterCard: "summary" }).map(
        (check) => check.message,
      ),
    ).toContain("twitter:card is summary. X will not draw the large card.");
  });

  it("should name a relative og:image URL", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        ogImageRaw: "/opengraph-image?abc",
      }).map((check) => check.message),
    ).toContain(
      "og:image is a relative URL (/opengraph-image?abc). Crawlers will not resolve it.",
    );
  });

  it("should name an http og:image on a public host", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        ogImageRaw: "http://example.com/og.png",
      }).map((check) => check.message),
    ).toContain(
      "og:image uses http://example.com/og.png. WhatsApp and Discord require https.",
    );
  });

  it("should not flag http images on localhost", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        ogImageRaw: "http://localhost:3000/og.png",
      }).map((check) => check.id),
    ).not.toContain("http-image");
  });

  it("should name live tags that are missing from the HTML source", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        crawlerInvisibleTags: ["og:title", "og:image"],
      }).map((check) => check.message),
    ).toContain(
      "og:title and og:image are present in the live DOM but missing from the HTML source. Crawlers will not see these tags.",
    );
  });

  it("should use singular copy for one crawler-invisible tag", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        crawlerInvisibleTags: ["og:title"],
      }).map((check) => check.message),
    ).toContain(
      "og:title is present in the live DOM but missing from the HTML source. Crawlers will not see this tag.",
    );
  });

  it("should flag an image under 200px", () => {
    expect(
      evaluateChecks(completeTags, {
        naturalHeight: 80,
        naturalWidth: 120,
      }).map((check) => check.message),
    ).toContain("og:image is 120×80, under 200px. Platforms may ignore it.");
  });

  it("should flag an image far from 1.91:1", () => {
    expect(
      evaluateChecks(completeTags, {
        naturalHeight: 800,
        naturalWidth: 800,
      }).map((check) => check.message),
    ).toContain(
      "og:image is 1:1. Platforms crop toward 1.91:1. Old Reddit square-crops.",
    );
  });

  it("should not flag a 16:9 image as far from 1.91:1", () => {
    expect(
      evaluateChecks(completeTags, {
        naturalHeight: 720,
        naturalWidth: 1280,
      }).map((check) => check.id),
    ).not.toContain("image-aspect");
  });

  it("should fall back to declared og:image width and height when natural size is unknown", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        ogImageHeight: "100",
        ogImageWidth: "100",
      }).map((check) => check.message),
    ).toContain("og:image is 100×100, under 200px. Platforms may ignore it.");
  });

  it("should flag Facebook file size over 8 MB", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        imageFileSizeBytes: 9 * 1024 * 1024,
      }).map((check) => check.message),
    ).toContain("og:image is 9.0 MB. Facebook rejects images over 8 MB.");
  });

  it("should flag WhatsApp file size over 600 KB when under 8 MB", () => {
    expect(
      evaluateChecks({
        ...completeTags,
        imageFileSizeBytes: 800 * 1024,
      }).map((check) => check.message),
    ).toContain("og:image is 800 KB. WhatsApp expects images under 600 KB.");
  });

  it("should skip image dimension checks when no image tag exists", () => {
    expect(
      evaluateChecks(
        {
          ...completeTags,
          image: "",
          ogImage: "",
          ogImageRaw: "",
          twitterImage: "",
          twitterImageRaw: "",
        },
        { naturalHeight: 80, naturalWidth: 80 },
      ).map((check) => check.id),
    ).not.toContain("image-too-small");
  });
});
