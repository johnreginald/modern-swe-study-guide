import Link from "next/link";
import { notFound } from "next/navigation";
import { hasBurmese, t } from "@/lib/i18n";

export default function Page() {
  if (!hasBurmese()) notFound();
  return (
    <div className="lang-my">
      <header className="page-head">
        <h1>{t("my", "offline.title")}</h1>
        <p className="muted">{t("my", "offline.text")}</p>
      </header>
      <div className="hero-actions">
        <Link href="/my" className="btn btn-primary">
          {t("my", "nav.home")}
        </Link>
        <Link href="/my/weeks" className="btn">
          {t("my", "nav.weeks")}
        </Link>
      </div>
    </div>
  );
}
