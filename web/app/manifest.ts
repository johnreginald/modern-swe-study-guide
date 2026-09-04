import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CS146S 2026 Self-Study Guide",
    short_name: "CS146S",
    description:
      "A project-based self-study companion to Stanford CS146S: The Modern Software Developer (Fall 2026). Videos, courses, articles, weekly builds, and a capstone.",
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
