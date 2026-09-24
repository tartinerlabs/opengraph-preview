import { useEffect, useState } from "react";
import {
  isRestrictedTabUrl,
  type OpenGraphTags,
  readOpenGraphFromDocument,
  resolveOgImageUrl,
} from "./extract-open-graph.ts";

export type TabIdentity = { title: string; url: string };

export type PreviewState =
  | { status: "loading"; tab: TabIdentity | null }
  | { status: "restricted"; tab: TabIdentity | null }
  | { status: "error"; tab: TabIdentity }
  | { status: "ready"; tab: TabIdentity; tags: OpenGraphTags };

export function useOpenGraphPreview(): PreviewState {
  const [state, setState] = useState<PreviewState>({
    status: "loading",
    tab: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      // activeTab grants url and title for the active tab once the popup opens.
      const identity: TabIdentity | null = tab
        ? { title: tab.title ?? "", url: tab.url ?? "" }
        : null;

      if (!tab?.id || !identity || isRestrictedTabUrl(tab.url)) {
        if (!cancelled) {
          setState({ status: "restricted", tab: identity });
        }
        return;
      }

      if (!cancelled) {
        setState({ status: "loading", tab: identity });
      }

      try {
        const results = await browser.scripting.executeScript({
          func: readOpenGraphFromDocument,
          target: { tabId: tab.id },
        });
        const raw = results[0]?.result;

        if (cancelled) {
          return;
        }

        if (!raw) {
          setState({ status: "error", tab: identity });
          return;
        }

        const pageUrl = tab.url ?? raw.url;
        setState({
          status: "ready",
          tab: identity,
          tags: {
            ...raw,
            faviconUrl:
              resolveOgImageUrl(raw.faviconUrl, pageUrl) ||
              resolveOgImageUrl("/favicon.ico", pageUrl),
            image: resolveOgImageUrl(raw.image, pageUrl),
            ogImage: resolveOgImageUrl(raw.ogImage, pageUrl),
            twitterImage: resolveOgImageUrl(raw.twitterImage, pageUrl),
          },
        });
      } catch {
        if (!cancelled) {
          setState({ status: "restricted", tab: identity });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
