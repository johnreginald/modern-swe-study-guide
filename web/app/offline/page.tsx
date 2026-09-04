import type { Metadata } from "next";
import Link from "next/link";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <>
      <header className="page-head">
        <h1>{t("en", "offline.title")}</h1>
        <p className="muted">{t("en", "offline.text")}</p>
      </header>
      <div className="hero-actions">
        <Link href="/" className="btn btn-primary">
          {t("en", "nav.home")}
        </Link>
        <Link href="/weeks" className="btn">
          {t("en", "nav.weeks")}
        </Link>
      </div>
    </>
  );
}
