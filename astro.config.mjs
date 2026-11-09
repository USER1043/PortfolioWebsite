import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import { calloutsPlugin } from "./src/lib/blog/callouts.mjs";

export default defineConfig({
  output: "static",
  site: process.env.PUBLIC_SITE_URL || "https://prajan-karthik.vercel.app",
  markdown: {
    // `> [!WARN]` style callouts in blog posts.
    processor: satteri({ hastPlugins: [calloutsPlugin] }),
    // Code colours come from CSS variables (src/styles/code.css), so they
    // follow the visitor's terminal theme.
    shikiConfig: { theme: "css-variables" },
  },
});
