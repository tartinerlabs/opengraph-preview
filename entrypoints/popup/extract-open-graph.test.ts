import { describe, expect, it } from "vitest";
import {
  displayHostname,
  isRestrictedTabUrl,
  resolveOgImageUrl,
} from "./extract-open-graph.ts";

describe("resolveOgImageUrl", () => {
  it("resolves a root-relative image against the tab URL", () => {
    expect(
      resolveOgImageUrl(
        "/opengraph-image?abc",
        "http://localhost:3000/blog/hello",
      ),
    ).toBe("http://localhost:3000/opengraph-image?abc");
  });

  it("leaves an absolute production URL unchanged", () => {
    expect(
      resolveOgImageUrl(
        "https://example.com/opengraph-image",
        "http://localhost:3000/",
      ),
    ).toBe("https://example.com/opengraph-image");
  });

  it("returns an empty string when the image tag is missing", () => {
    expect(resolveOgImageUrl("", "http://localhost:3000/")).toBe("");
    expect(resolveOgImageUrl("   ", "http://localhost:3000/")).toBe("");
  });

  it("returns the original value when the URL cannot be parsed", () => {
    expect(resolveOgImageUrl("not a url", "not-a-base")).toBe("not a url");
  });
});

describe("isRestrictedTabUrl", () => {
  it("treats missing and blank URLs as restricted", () => {
    expect(isRestrictedTabUrl(undefined)).toBe(true);
    expect(isRestrictedTabUrl("")).toBe(true);
  });

  it("blocks browser-internal and store pages", () => {
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

  it("allows localhost and ordinary https pages", () => {
    expect(isRestrictedTabUrl("http://localhost:3000/blog")).toBe(false);
    expect(isRestrictedTabUrl("https://example.com/post")).toBe(false);
  });
});

describe("displayHostname", () => {
  it("strips a leading www from the hostname", () => {
    expect(displayHostname("https://www.example.com/path")).toBe("example.com");
  });

  it("returns an empty string for an invalid URL", () => {
    expect(displayHostname("not a url")).toBe("");
  });
});
