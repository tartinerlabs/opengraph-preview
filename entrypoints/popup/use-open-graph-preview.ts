import { useEffect, useState } from "react";
import {
  isRestrictedTabUrl,
  type OpenGraphTags,
  readOpenGraphFromDocument,
  resolveOgImageUrl,
} from "./extract-open-graph.ts";

export type PreviewState =
  | { status: "loading" }
  | { status: "restricted" }
  | { status: "error" }
  | { status: "ready"; tags: OpenGraphTags };

export function useOpenGraphPreview(): PreviewState {
  const [state, setState] = useState<PreviewState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id || isRestrictedTabUrl(tab.url)) {
        if (!cancelled) {
          setState({ status: "restricted" });
        }
        return;
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
          setState({ status: "error" });
          return;
        }

        const pageUrl = tab.url ?? raw.url;
        setState({
          status: "ready",
          tags: {
            ...raw,
            image: resolveOgImageUrl(raw.image, pageUrl),
            ogImage: resolveOgImageUrl(raw.ogImage, pageUrl),
            twitterImage: resolveOgImageUrl(raw.twitterImage, pageUrl),
          },
        });
      } catch {
        if (!cancelled) {
          setState({ status: "restricted" });
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
