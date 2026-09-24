import { describe, expect, it } from "vitest";
import {
  displayHostname,
  isRestrictedTabUrl,
  resolveOgImageUrl,
  withCacheBuster,
} from "./extract-open-graph.ts";

describe("resolveOgImageUrl", () => {
  it("should resolve a root-relative image against the tab URL", () => {
    expect(
      resolveOgImageUrl(
        "/opengraph-image?abc",
        "http://localhost:3000/blog/hello",
      ),
    ).toBe("http://localhost:3000/opengraph-image?abc");
  });

  it("should leave an absolute production URL unchanged", () => {
    expect(
      resolveOgImageUrl(
        "https://example.com/opengraph-image",
        "http://localhost:3000/",
      ),
    ).toBe("https://example.com/opengraph-image");
  });

  it("should return an empty string when the image tag is missing", () => {
    expect(resolveOgImageUrl("", "http://localhost:3000/")).toBe("");
    expect(resolveOgImageUrl("   ", "http://localhost:3000/")).toBe("");
  });

  it("should return the original value when the URL cannot be parsed", () => {
    expect(resolveOgImageUrl("not a url", "not-a-base")).toBe("not a url");
  });
});

describe("isRestrictedTabUrl", () => {
  it("should treat missing and blank URLs as restricted", () => {
    expect(isRestrictedTabUrl(undefined)).toBe(true);
    expect(isRestrictedTabUrl("")).toBe(true);
  });

  it("should block browser-internal and store pages", () => {
    expect(isRestrictedTabUrl("chrome://extensions")).toBe(true);
    expect(isRestrictedTabUrl("about:blank")).toBe(true);
    expect(isRestrictedTabUrl("file:///tmp/index.html")).toBe(true);
    expect(
      isRestrictedTabUrl("https://chromewebstore.google.com/detail/foo"),
    ).toBe(true);
    expect(
      isRestrictedTabUrl("https://chrome.google.com/webstore/detail/foo"),
    ).toBe(true);
  });

  it("should allow localhost and ordinary https pages", () => {
    expect(isRestrictedTabUrl("http://localhost:3000/blog")).toBe(false);
    expect(isRestrictedTabUrl("https://example.com/post")).toBe(false);
  });
});

describe("displayHostname", () => {
  it("should strip a leading www from the hostname", () => {
    expect(displayHostname("https://www.example.com/path")).toBe("example.com");
  });

  it("should return an empty string for an invalid URL", () => {
    expect(displayHostname("not a url")).toBe("");
  });
});

describe("withCacheBuster", () => {
  it("should add a token to an image URL without a query", () => {
    expect(withCacheBuster("https://example.com/og.png", "abc")).toBe(
      "https://example.com/og.png?_ogp=abc",
    );
  });

  it("should keep the existing query and hash untouched", () => {
    expect(
      withCacheBuster("https://example.com/og?url=a%20b&w=1#x", "abc"),
    ).toBe("https://example.com/og?url=a%20b&w=1&_ogp=abc#x");
  });

  it("should leave data URLs and invalid input alone", () => {
    expect(withCacheBuster("data:image/png;base64,AAAA", "abc")).toBe(
      "data:image/png;base64,AAAA",
    );
    expect(withCacheBuster("", "abc")).toBe("");
  });
});
