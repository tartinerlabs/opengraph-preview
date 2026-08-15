import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const repoRoot = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: [tailwindcss()],
  root: `${repoRoot}/marketing/capture`,
  server: {
    fs: {
      allow: [repoRoot],
    },
    port: 4177,
    strictPort: true,
  },
};
