import React from "react";
import ReactDOM from "react-dom/client";
import type { OpenGraphTags } from "../../entrypoints/popup/extract-open-graph.ts";
import { PreviewTabs } from "../../entrypoints/popup/preview-tabs.tsx";
import "../../entrypoints/popup/style.css";
import "./capture.css";

const SAMPLE_TAGS: OpenGraphTags = {
  description:
    "Preview og:image and social cards on localhost before you deploy.",
  image: "/og-sample.png",
  siteName: "Acme",
  title: "Hello from localhost",
  url: "http://localhost:3000/blog/hello",
};

const TABS = ["image", "x", "facebook", "linkedin", "slack"] as const;

function tabFromUrl(): string {
  const tab = new URLSearchParams(window.location.search).get("tab");
  return TABS.find((value) => value === tab) ?? "image";
}

function Capture() {
  return (
    <div className="capture">
      <div className="capture-chrome">
        <div className="capture-traffic">
          <span />
          <span />
          <span />
        </div>
        <div className="capture-omnibox">localhost:3000/blog/hello</div>
        <img
          alt=""
          className="capture-toolbar-icon"
          height={20}
          src="/icon-32.png"
          width={20}
        />
      </div>
      <div className="capture-page">
        <p className="capture-kicker">localhost:3000</p>
        <h1>Hello from localhost</h1>
        <p className="capture-lede">
          Preview og:image and social cards on localhost before you deploy.
        </p>
      </div>
      <div className="capture-popup">
        <PreviewTabs defaultSelectedKey={tabFromUrl()} tags={SAMPLE_TAGS} />
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Capture />
    </React.StrictMode>,
  );
}
