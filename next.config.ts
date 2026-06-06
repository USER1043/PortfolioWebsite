/**
 * @file Next.js 15 configuration — minimal setup for SSG portfolio.
 * @module next.config
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // SSG: pre-renders all pages to static HTML at build time
  images: {
    unoptimized: true, // Required for static export — no image optimization server available
  },
};

export default nextConfig;
