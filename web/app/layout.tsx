import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import SwRegister from "@/components/SwRegister";

const SITE_NAME = "Agent Engineer Study Guide 2026";
const DESCRIPTION =
  "A ten-week, project-based guide to building software with coding agents: internals, context engineering, MCP, skills, readiness, review, security, background agents, teams, and the software factory.";

export const metadata: Metadata = {
  metadataBase: new URL("https://modern-software-dev-guide.vercel.app"),
  title: {
    default: SITE_NAME,
    template: "%s · Agent Engineer Guide",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Agent Guide",
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
          <BottomNav />
        </div>
        <SwRegister />
      </body>
    </html>
  );
}
