import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";
import { iconSubset } from "./vite-icon-subset.ts";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss(), iconSubset()],
  }),
  manifest: {
    name: "Open Graph Preview",
    permissions: ["activeTab", "scripting"],
    icons: {
      16: "/icons/16.png",
      32: "/icons/32.png",
      48: "/icons/48.png",
      96: "/icons/96.png",
      128: "/icons/128.png",
    },
    commands: {
      _execute_action: {
        suggested_key: {
          default: "Alt+Shift+O",
          mac: "Alt+Shift+O",
        },
        description: "Open the Open Graph preview",
      },
    },
  },
});
