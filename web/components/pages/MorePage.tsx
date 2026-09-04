import Link from "next/link";
import { getGuide } from "@/lib/guide";
import { href, t, type Lang } from "@/lib/i18n";
import ResetProgress from "@/components/ResetProgress";
import LangSwitch from "@/components/LangSwitch";

export default function MorePage({ lang, burmeseAvailable }: { lang: Lang; burmeseAvailable: boolean }) {
  const guide = getGuide(lang);
  return (
    <div className={lang === "my" ? "lang-my" : undefined}>
      <header className="page-head">
        <h1>{t(lang, "more.title")}</h1>
      </header>

      <ul className="link-list">
        {burmeseAvailable ? (
          <li>
            <LangSwitch
              lang={lang}
              toEn={t(lang, "lang.switchToEnglish")}
              toMy={t(lang, "lang.switchToBurmese")}
              className="lang-row"
            />
          </li>
        ) : null}
        <li>
          <Link href={href(lang, "/bookshelf")}>
            <strong>{t(lang, "more.bookshelf")}</strong>
            <span className="muted small">{t(lang, "more.bookshelfSub")}</span>
          </Link>
        </li>
        <li>
          <Link href={href(lang, "/half-time")}>
            <strong>{t(lang, "more.halfTime")}</strong>
            <span className="muted small">{t(lang, "more.halfTimeSub")}</span>
          </Link>
        </li>
        <li>
          <Link href={`${href(lang, "/")}#at-a-glance`}>
            <strong>{t(lang, "more.glance")}</strong>
            <span className="muted small">{t(lang, "more.glanceSub")}</span>
          </Link>
        </li>
        <li>
          <a href="/agentic-engineer-study-guide-2026.pdf" target="_blank" rel="noopener noreferrer">
            <strong>{t(lang, "more.pdf")}</strong>
            <span className="muted small">{t(lang, "more.pdfSub")}</span>
          </a>
        </li>
      </ul>

      <section className="home-section">
        <h2>{t(lang, "more.progress")}</h2>
        <p className="muted small">{t(lang, "more.progressNote")}</p>
        <ResetProgress
          weeks={guide.weeks.map((w) => w.n)}
          labels={{
            reset: t(lang, "more.reset"),
            confirm: t(lang, "more.resetConfirm"),
            yes: t(lang, "more.resetYes"),
            cancel: t(lang, "more.resetCancel"),
          }}
        />
      </section>

      <section className="home-section">
        <h2>{t(lang, "more.about")}</h2>
        <p className="muted small">{t(lang, "more.aboutText", { date: guide.updated })}</p>
        {lang === "my" ? <p className="muted small">{t(lang, "more.translationNote")}</p> : null}
        <p className="muted small">
          <a href="https://themodernsoftware.dev/" target="_blank" rel="noopener noreferrer">
            themodernsoftware.dev
          </a>
        </p>
      </section>
    </div>
  );
}
