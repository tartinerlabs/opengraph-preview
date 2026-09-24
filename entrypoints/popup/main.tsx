import iconSets from "virtual:icon-subset";
import { addCollection } from "@iconify/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.tsx";
import "./style.css";

// Icons are bundled, so @iconify/react never requests api.iconify.design.
for (const set of iconSets) {
  addCollection(set);
}

// Follow the OS colour scheme. MV3 blocks inline scripts, so style.css paints
// the right background from a prefers-color-scheme block before this runs.
const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");

function applyColorScheme() {
  const theme = darkScheme.matches ? "dark" : "light";
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.dataset.theme = theme;
}

applyColorScheme();
darkScheme.addEventListener("change", applyColorScheme);

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
