import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import { calloutsPlugin } from "./src/lib/blog/callouts.mjs";
import { labelListsPlugin } from "./src/lib/blog/labelLists.mjs";

export default defineConfig({
  output: "static",
  site: process.env.PUBLIC_SITE_URL || "https://prajan-karthik.vercel.app",
  markdown: {
    // Blog extras: `> [!WARN]` callouts and `- **Why:** …` labelled lists.
    processor: satteri({ hastPlugins: [calloutsPlugin, labelListsPlugin] }),
    // Code colours come from CSS variables (see "Code highlighting" in src/styles/global.css), so they
    // follow the visitor's terminal theme.
    shikiConfig: { theme: "css-variables" },
  },
});
