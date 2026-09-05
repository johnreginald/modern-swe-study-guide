import { getGuide } from "@/lib/guide";
import { t, type Lang } from "@/lib/i18n";
import { Blocks } from "@/components/Blocks";

/** Whole guide on one page, used to print the PDF with headless Chrome. */
export default function PrintPage({ lang }: { lang: Lang }) {
  const guide = getGuide(lang);
  const sections = guide.home.filter((s) => s.id !== "at-a-glance");
  return (
    <div className={`print-page${lang === "my" ? " lang-my" : ""}`}>
      <header className="print-cover">
        <div className="eyebrow">{t(lang, "hero.eyebrow")}</div>
        <h1>{t(lang, "hero.title")}</h1>
        <p className="hero-sub">{t(lang, "hero.subtitle")}</p>
        <p className="muted small">{t(lang, "hero.updated", { date: guide.updated, count: guide.linkCount })}</p>
        <p className="muted small">https://agentic-engineer-study-guide.vercel.app{lang === "my" ? "/my" : ""}</p>
      </header>

      <Blocks blocks={guide.intro} />

      <section className="home-section">
        <h2>{t(lang, "glance.title")}</h2>
        <ol className="week-list">
          {guide.weeks.map((w) => (
            <li key={w.n}>
              <span className="week-num">{w.n}</span>
              <span className="week-text">
                <span className="week-title">{w.title}</span>
                {w.build ? <span className="muted small" dangerouslySetInnerHTML={{ __html: w.build }} /> : null}
              </span>
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

      {guide.weeks.map((week) => (
        <section key={week.n} className="print-week">
          <header className="page-head">
            <div className="eyebrow">{t(lang, "week.ofTotal", { n: week.n, total: guide.weeks.length })}</div>
            <h1>{week.title}</h1>
            <div className="meta-row">
              {week.coreTime ? <span className="tag">{t(lang, "week.core", { time: week.coreTime })}</span> : null}
              <span className="tag">{t(lang, "week.videos", { count: week.videoCount })}</span>
              <span className="tag">{t(lang, "week.criteria", { count: week.doneWhen.length })}</span>
            </div>
            {week.focus ? (
              <p className="focus">
                <span className="focus-label">{t(lang, "week.focus")}</span>
                <span dangerouslySetInnerHTML={{ __html: week.focus }} />
              </p>
            ) : null}
            {week.build ? (
              <p className="focus">
                <span className="focus-label">{t(lang, "week.youBuild")}</span>
                <span dangerouslySetInnerHTML={{ __html: week.build }} />
              </p>
            ) : null}
          </header>
          <Blocks blocks={week.blocks} />
          <section className="done-when">
            <div className="done-when-head">
              <h3>{t(lang, "doneWhen.title")}</h3>
            </div>
            <ul className="checklist print-checklist">
              {week.doneWhen.map((html, i) => (
                <li key={i}>
                  <span className="box" aria-hidden="true" />
                  <span dangerouslySetInnerHTML={{ __html: html }} />
                </li>
              ))}
            </ul>
          </section>
        </section>
      ))}

      {([guide.capstone, guide.bookshelf, guide.halfTime] as const).map((s) => (
        <section key={s.title} className="print-week">
          <header className="page-head">
            <h1>{s.title}</h1>
          </header>
          <Blocks blocks={s.blocks} />
        </section>
      ))}
    </div>
  );
}
