import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, getWeek } from "@/lib/guide";
import { href, t, type Lang } from "@/lib/i18n";
import DoneWhen from "@/components/DoneWhen";
import { Blocks, JumpChips } from "@/components/Blocks";

export default function WeekPage({ lang, n }: { lang: Lang; n: number }) {
  const week = getWeek(n, lang);
  if (!week) notFound();
  const weeks = getGuide(lang).weeks;
  const prev = weeks.find((w) => w.n === week.n - 1);
  const next = weeks.find((w) => w.n === week.n + 1);

  return (
    <div className={lang === "my" ? "lang-my" : undefined}>
      <header className="page-head">
        <div className="eyebrow">{t(lang, "week.ofTotal", { n: week.n, total: weeks.length })}</div>
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
            <span>{week.build}</span>
          </p>
        ) : null}
      </header>

      <JumpChips blocks={week.blocks} extra={[{ id: `done-when-${week.n}`, title: t(lang, "doneWhen.title") }]} />

      <Blocks blocks={week.blocks} />

      <DoneWhen week={week.n} items={week.doneWhen} title={t(lang, "doneWhen.title")} />

      <nav className="pager" aria-label="Week navigation">
        {prev ? (
          <Link href={href(lang, `/week/${prev.n}`)} className="btn">
            {t(lang, "week.prev", { n: prev.n })}
          </Link>
        ) : (
          <Link href={href(lang, "/")} className="btn">
            {t(lang, "week.home")}
          </Link>
        )}
        {next ? (
          <Link href={href(lang, `/week/${next.n}`)} className="btn btn-primary">
            {t(lang, "week.next", { n: next.n })}
          </Link>
        ) : (
          <Link href={href(lang, "/capstone")} className="btn btn-primary">
            {t(lang, "week.capstone")}
          </Link>
        )}
      </nav>
    </div>
  );
}
