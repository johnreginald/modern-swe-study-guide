import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import SwRegister from "@/components/SwRegister";
import InstallHint from "@/components/InstallHint";

const SITE_NAME = "CS146S 2026 Self-Study Guide";
const DESCRIPTION =
  "A project-based self-study companion to Stanford CS146S: The Modern Software Developer (Fall 2026). Ten weeks of videos, courses, articles, builds, and a capstone.";

export const metadata: Metadata = {
  metadataBase: new URL("https://modern-software-dev-guide.vercel.app"),
  title: {
    default: SITE_NAME,
    template: "%s · CS146S 2026",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "CS146S",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: SITE_NAME,
    description: DESCRIPTION,
    type: "website",
    images: [{ url: "/icons/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#132238" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1421" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <main className="content">{children}</main>
          <InstallHint />
          <BottomNav />
        </div>
        <SwRegister />
      </body>
    </html>
  );
}
