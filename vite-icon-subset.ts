import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

// Every icon the popup renders. The popup registers only these with
// addCollection, so @iconify/react never falls back to api.iconify.design.
// Adding an icon to the UI means adding its name here.
export const ICON_NAMES = {
  "gravity-ui": [
    "check",
    "circle-check",
    "circle-exclamation",
    "circle-info",
    "circle-xmark",
    "code",
    "copy",
    "eye",
    "globe",
    "lock",
    "picture",
    "triangle-exclamation",
  ],
  "simple-icons": [
    "discord",
    "facebook",
    "linkedin",
    "reddit",
    "slack",
    "whatsapp",
    "x",
  ],
} as const;

// The Vite plugin hooks this uses. vite is not a direct dependency (WXT
// bundles it), so the shape is declared here rather than imported.
type IconSubsetPlugin = {
  load: (id: string) => string | undefined;
  name: string;
  resolveId: (id: string) => string | undefined;
};

const MODULE_ID = "virtual:icon-subset";
const RESOLVED_ID = `\0${MODULE_ID}`;
const require = createRequire(import.meta.url);

// The full simple-icons set is several MB; bundle only the icons we use.
export function iconSubset(): IconSubsetPlugin {
  return {
    name: "icon-subset",
    resolveId: (id) => (id === MODULE_ID ? RESOLVED_ID : undefined),
    load(id) {
      if (id !== RESOLVED_ID) {
        return undefined;
      }
      const sets = Object.entries(ICON_NAMES).map(([prefix, names]) => {
        const json = JSON.parse(
          readFileSync(
            require.resolve(`@iconify-json/${prefix}/icons.json`),
            "utf8",
          ),
        );
        const icons = Object.fromEntries(
          names.map((name) => {
            const icon = json.icons[name];
            if (!icon) {
              throw new Error(
                `${prefix}:${name} is not in @iconify-json/${prefix}`,
              );
            }
            return [name, icon];
          }),
        );
        return { prefix, icons, width: json.width, height: json.height };
      });
      return `export default ${JSON.stringify(sets)};`;
    },
  };
}
