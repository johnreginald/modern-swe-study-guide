import type { Metadata, Viewport } from "next";
import { Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import SwRegister from "@/components/SwRegister";
import LangEffect from "@/components/LangEffect";
import { hasBurmese, t } from "@/lib/i18n";

const myanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  weight: ["400", "700"],
  variable: "--font-my",
  display: "swap",
});

const SITE_NAME = "Agentic Engineer Study Guide 2026";
const DESCRIPTION =
  "A ten-week, project-based guide to building software with coding agents: internals, context engineering, MCP, skills, readiness, review, security, background agents, teams, and the software factory.";

export const metadata: Metadata = {
  metadataBase: new URL("https://modern-swe.burmese.dev"),
  title: {
    default: SITE_NAME,
    template: "%s · Agentic Engineer Guide",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Agentic Guide",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  alternates: { languages: { en: "/", my: "/my" } },
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
  const burmese = hasBurmese();
  const navLabels = {
    en: { home: t("en", "nav.home"), weeks: t("en", "nav.weeks"), capstone: t("en", "nav.capstone"), more: t("en", "nav.more") },
    my: { home: t("my", "nav.home"), weeks: t("my", "nav.weeks"), capstone: t("my", "nav.capstone"), more: t("my", "nav.more") },
  };
  return (
    <html lang="en" className={myanmar.variable}>
      <body>
        <div className="app-shell">
          <main className="content">{children}</main>
          <BottomNav labels={navLabels} />
        </div>
        <LangEffect burmeseAvailable={burmese} />
        <SwRegister />
      </body>
    </html>
  );
}
