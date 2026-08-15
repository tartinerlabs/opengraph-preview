export type OpenGraphTags = {
  description: string;
  image: string;
  siteName: string;
  title: string;
  url: string;
};

const RESTRICTED_PROTOCOL =
  /^(chrome|edge|about|brave|opera|chrome-extension|moz-extension|devtools|file):/i;

const WEB_STORE_HOSTS = new Set([
  "addons.mozilla.org",
  "chromewebstore.google.com",
  "microsoftedge.microsoft.com",
]);

export function isRestrictedTabUrl(url: string | undefined): boolean {
  if (!url) {
    return true;
  }

  if (RESTRICTED_PROTOCOL.test(url)) {
    return true;
  }

  try {
    const parsed = new URL(url);
    if (WEB_STORE_HOSTS.has(parsed.hostname)) {
      return true;
    }
    return (
      parsed.hostname === "chrome.google.com" &&
      parsed.pathname.startsWith("/webstore")
    );
  } catch {
    return true;
  }
}

export function resolveOgImageUrl(image: string, pageUrl: string): string {
  const trimmed = image.trim();
  if (!trimmed) {
    return "";
  }

  try {
    return new URL(trimmed, pageUrl).href;
  } catch {
    return trimmed;
  }
}

export function displayHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

/**
 * Injected via scripting.executeScript. Must stay self-contained (no imports
 * or closed-over bindings) so Chrome can serialize the function body.
 */
export function readOpenGraphFromDocument(): OpenGraphTags {
  const content = (...selectors: string[]): string => {
    for (const selector of selectors) {
      const value = document
        .querySelector(selector)
        ?.getAttribute("content")
        ?.trim();
      if (value) {
        return value;
      }
    }
    return "";
  };

  const title =
    content('meta[property="og:title"]', 'meta[name="og:title"]') ||
    content('meta[name="twitter:title"]', 'meta[property="twitter:title"]') ||
    document.title;
  const description =
    content('meta[property="og:description"]', 'meta[name="og:description"]') ||
    content(
      'meta[name="twitter:description"]',
      'meta[property="twitter:description"]',
    ) ||
    content('meta[name="description"]');
  const image =
    content('meta[property="og:image"]', 'meta[name="og:image"]') ||
    content('meta[name="twitter:image"]', 'meta[property="twitter:image"]');
  const url =
    content('meta[property="og:url"]', 'meta[name="og:url"]') || location.href;
  const siteName =
    content('meta[property="og:site_name"]', 'meta[name="og:site_name"]') ||
    location.hostname;

  return { description, image, siteName, title, url };
}
