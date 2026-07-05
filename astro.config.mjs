import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  integrations: [mdx()],
  output: "static",
  site: process.env.PUBLIC_SITE_URL || "https://prajan-karthik.dev",
  vite: {
    define: {
      "process.env.GITHUB_TOKEN": JSON.stringify(process.env.GITHUB_TOKEN),
      "process.env.GITHUB_USERNAME": JSON.stringify(
        process.env.GITHUB_USERNAME,
      ),
    },
  },
});
