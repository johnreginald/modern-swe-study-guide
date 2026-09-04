import Link from "next/link";
import { getGuide } from "@/lib/guide";
import { href, t, type Lang } from "@/lib/i18n";
import { OverallProgress } from "@/components/Progress";
import { Blocks } from "@/components/Blocks";
import InstallHint from "@/components/InstallHint";
import LangSwitch from "@/components/LangSwitch";

export default function HomePage({ lang, burmeseAvailable }: { lang: Lang; burmeseAvailable: boolean }) {
  const guide = getGuide(lang);
  const weeks = guide.weeks.map((w) => ({ n: w.n, total: w.doneWhen.length }));
  const sections = guide.home.filter((s) => s.id !== "at-a-glance");
  return (
    <div className={lang === "my" ? "lang-my" : undefined}>
      <header className="hero">
        <div className="eyebrow">{t(lang, "hero.eyebrow")}</div>
        <h1>{t(lang, "hero.title")}</h1>
        <p className="hero-sub">{t(lang, "hero.subtitle")}</p>
        <p className="muted small">{t(lang, "hero.updated", { date: guide.updated, count: guide.linkCount })}</p>
        <div className="hero-actions">
          <Link href={href(lang, "/week/1")} className="btn btn-primary">
            {t(lang, "hero.start")}
          </Link>
          <Link href={href(lang, "/weeks")} className="btn">
            {t(lang, "hero.allWeeks")}
          </Link>
          {burmeseAvailable ? (
            <LangSwitch lang={lang} toEn={t(lang, "lang.switchToEnglish")} toMy={t(lang, "lang.switchToBurmese")} className="btn" />
          ) : null}
        </div>
      </header>

      <InstallHint
        labels={{
          title: t(lang, "install.title"),
          ios: t(lang, "install.ios"),
          other: t(lang, "install.other"),
          button: t(lang, "install.button"),
          dismiss: t(lang, "install.dismiss"),
        }}
      />

      <OverallProgress weeks={weeks} title={t(lang, "progress.title")} summary={t(lang, "progress.summary")} />

      {lang === "my" ? <p className="muted small translation-note">{t(lang, "more.translationNote")}</p> : null}

      <Blocks blocks={guide.intro} />

      <section id="at-a-glance" className="home-section">
        <h2>{t(lang, "glance.title")}</h2>
        <ol className="week-list">
          {guide.weeks.map((w) => (
            <li key={w.n}>
              <Link href={href(lang, `/week/${w.n}`)}>
                <span className="week-num">{w.n}</span>
                <span className="week-text">
                  <span className="week-title">{w.title}</span>
                  {w.build ? <span className="muted small" dangerouslySetInnerHTML={{ __html: w.build }} /> : null}
                </span>
                <span className="chev" aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className="home-section">
          <h2>{section.title}</h2>
          <Blocks blocks={section.blocks} level={3} />
        </section>
      ))}
    </div>
  );
}
