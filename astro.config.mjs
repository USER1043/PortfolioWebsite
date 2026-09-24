import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  integrations: [mdx()],
  output: "static",
  site: process.env.PUBLIC_SITE_URL || "https://prajan-karthik.dev",
});
