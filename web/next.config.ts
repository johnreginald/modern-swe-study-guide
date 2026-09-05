import type { NextConfig } from "next";

// Static export: every route is prerendered, so the site deploys as plain files
// (Cloudflare Pages). Response headers live in public/_headers.
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
