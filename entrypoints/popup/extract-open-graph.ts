export type OpenGraphTags = {
  crawlerInvisibleTags: string[];
  description: string;
  image: string;
  imageFileSizeBytes: number | null;
  ogDescription: string;
  ogImage: string;
  ogImageHeight: string;
  ogImageRaw: string;
  ogImageWidth: string;
  ogSiteName: string;
  ogTitle: string;
  ogUrl: string;
  siteName: string;
  themeColor: string;
  title: string;
  twitterCard: string;
  twitterDescription: string;
  twitterImage: string;
  twitterImageRaw: string;
  twitterTitle: string;
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
export async function readOpenGraphFromDocument(): Promise<OpenGraphTags> {
  const read = (root: ParentNode, ...selectors: string[]): string => {
    for (const selector of selectors) {
      const value = root
        .querySelector(selector)
        ?.getAttribute("content")
        ?.trim();
      if (value) {
        return value;
      }
    }
    return "";
  };

  const ogTitle = read(
    document,
    'meta[property="og:title"]',
    'meta[name="og:title"]',
  );
  const ogDescription = read(
    document,
    'meta[property="og:description"]',
    'meta[name="og:description"]',
  );
  const ogImage = read(
    document,
    'meta[property="og:image"]',
    'meta[name="og:image"]',
  );
  const ogImageWidth = read(
    document,
    'meta[property="og:image:width"]',
    'meta[name="og:image:width"]',
  );
  const ogImageHeight = read(
    document,
    'meta[property="og:image:height"]',
    'meta[name="og:image:height"]',
  );
  const twitterCard = read(
    document,
    'meta[name="twitter:card"]',
    'meta[property="twitter:card"]',
  );
  const twitterTitle = read(
    document,
    'meta[name="twitter:title"]',
    'meta[property="twitter:title"]',
  );
  const twitterDescription = read(
    document,
    'meta[name="twitter:description"]',
    'meta[property="twitter:description"]',
  );
  const twitterImage = read(
    document,
    'meta[name="twitter:image"]',
    'meta[property="twitter:image"]',
  );
  const themeColor = read(document, 'meta[name="theme-color"]');

  const title = ogTitle || twitterTitle || document.title;
  const description =
    ogDescription ||
    twitterDescription ||
    read(document, 'meta[name="description"]');
  const image = ogImage || twitterImage;
  const ogUrl = read(
    document,
    'meta[property="og:url"]',
    'meta[name="og:url"]',
  );
  const ogSiteName = read(
    document,
    'meta[property="og:site_name"]',
    'meta[name="og:site_name"]',
  );
  const url = ogUrl || location.href;
  const siteName = ogSiteName || location.hostname;

  const compared: Array<{ name: string; selectors: string[] }> = [
    {
      name: "og:title",
      selectors: ['meta[property="og:title"]', 'meta[name="og:title"]'],
    },
    {
      name: "og:description",
      selectors: [
        'meta[property="og:description"]',
        'meta[name="og:description"]',
      ],
    },
    {
      name: "og:image",
      selectors: ['meta[property="og:image"]', 'meta[name="og:image"]'],
    },
    {
      name: "og:image:width",
      selectors: [
        'meta[property="og:image:width"]',
        'meta[name="og:image:width"]',
      ],
    },
    {
      name: "og:image:height",
      selectors: [
        'meta[property="og:image:height"]',
        'meta[name="og:image:height"]',
      ],
    },
    {
      name: "og:url",
      selectors: ['meta[property="og:url"]', 'meta[name="og:url"]'],
    },
    {
      name: "og:site_name",
      selectors: ['meta[property="og:site_name"]', 'meta[name="og:site_name"]'],
    },
    {
      name: "twitter:card",
      selectors: ['meta[name="twitter:card"]', 'meta[property="twitter:card"]'],
    },
    {
      name: "twitter:title",
      selectors: [
        'meta[name="twitter:title"]',
        'meta[property="twitter:title"]',
      ],
    },
    {
      name: "twitter:description",
      selectors: [
        'meta[name="twitter:description"]',
        'meta[property="twitter:description"]',
      ],
    },
    {
      name: "twitter:image",
      selectors: [
        'meta[name="twitter:image"]',
        'meta[property="twitter:image"]',
      ],
    },
    { name: "theme-color", selectors: ['meta[name="theme-color"]'] },
  ];

  let crawlerInvisibleTags: string[] = [];
  try {
    const response = await fetch(location.href, {
      credentials: "same-origin",
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      const sourceDoc = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      );
      crawlerInvisibleTags = compared
        .filter(
          ({ selectors }) =>
            Boolean(read(document, ...selectors)) &&
            !read(sourceDoc, ...selectors),
        )
        .map(({ name }) => name);
    }
  } catch {
    crawlerInvisibleTags = [];
  }

  let imageFileSizeBytes: number | null = null;
  const rawImage = ogImage || twitterImage;
  if (rawImage) {
    try {
      const resolved = new URL(rawImage, location.href);
      if (resolved.origin === location.origin) {
        const response = await fetch(resolved.href, {
          credentials: "same-origin",
          method: "HEAD",
          signal: AbortSignal.timeout(4000),
        });
        const length = response.headers.get("content-length");
        if (length) {
          const parsed = Number(length);
          if (Number.isFinite(parsed) && parsed > 0) {
            imageFileSizeBytes = parsed;
          }
        }
      }
    } catch {
      imageFileSizeBytes = null;
    }
  }

  return {
    crawlerInvisibleTags,
    description,
    image,
    imageFileSizeBytes,
    ogDescription,
    ogImage,
    ogImageHeight,
    ogImageRaw: ogImage,
    ogImageWidth,
    ogSiteName,
    ogTitle,
    ogUrl,
    siteName,
    themeColor,
    title,
    twitterCard,
    twitterDescription,
    twitterImage,
    twitterImageRaw: twitterImage,
    twitterTitle,
    url,
  };
}
