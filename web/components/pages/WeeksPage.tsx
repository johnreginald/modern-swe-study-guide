import Link from "next/link";
import { getGuide } from "@/lib/guide";
import { href, t, type Lang } from "@/lib/i18n";
import { OverallProgress, WeekBadge } from "@/components/Progress";

export default function WeeksPage({ lang }: { lang: Lang }) {
  const guide = getGuide(lang);
  const meta = guide.weeks.map((w) => ({ n: w.n, total: w.doneWhen.length }));
  return (
    <div className={lang === "my" ? "lang-my" : undefined}>
      <header className="page-head">
        <h1>{t(lang, "weeks.title")}</h1>
        <p className="muted">{t(lang, "weeks.intro")}</p>
      </header>
      <OverallProgress weeks={meta} title={t(lang, "progress.title")} summary={t(lang, "progress.summary")} />
      <ol className="week-cards">
        {guide.weeks.map((w) => (
          <li key={w.n}>
            <Link href={href(lang, `/week/${w.n}`)} className="week-card">
              <div className="week-card-top">
                <span className="week-num">{t(lang, "week.label", { n: w.n })}</span>
                <WeekBadge week={{ n: w.n, total: w.doneWhen.length }} doneLabel={t(lang, "progress.done")} />
              </div>
              <h2>{w.title}</h2>
              {w.build ? (
                <p className="small">
                  <span className="muted">{t(lang, "week.youBuildInline")}</span> <span dangerouslySetInnerHTML={{ __html: w.build }} />
                </p>
              ) : null}
              <div className="meta-row">
                {w.coreTime ? <span className="tag">{t(lang, "week.core", { time: w.coreTime })}</span> : null}
                <span className="tag">{t(lang, "week.videos", { count: w.videoCount })}</span>
                <span className="tag">{t(lang, "week.criteria", { count: w.doneWhen.length })}</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
