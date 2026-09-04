import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agent Engineer Study Guide 2026",
    short_name: "Agent Guide",
    description:
      "A ten-week, project-based guide to building software with coding agents: internals, context engineering, MCP, skills, readiness, review, security, background agents, teams, and the software factory.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#132238",
    theme_color: "#132238",
    lang: "en",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
