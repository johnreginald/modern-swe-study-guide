import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, getWeek } from "@/lib/guide";
import DoneWhen from "@/components/DoneWhen";

export function generateStaticParams() {
  return getGuide().weeks.map((w) => ({ n: String(w.n) }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/week/[n]">): Promise<Metadata> {
  const { n } = await params;
  const week = getWeek(Number(n));
  if (!week) return {};
  return {
    title: `Week ${week.n} — ${week.title}`,
    description: week.focus.replace(/<[^>]+>/g, ""),
  };
}

export default async function WeekPage({ params }: PageProps<"/week/[n]">) {
  const { n } = await params;
  const week = getWeek(Number(n));
  if (!week) notFound();
  const weeks = getGuide().weeks;
  const prev = weeks.find((w) => w.n === week.n - 1);
  const next = weeks.find((w) => w.n === week.n + 1);

  return (
    <>
      <header className="page-head">
        <div className="eyebrow">Week {week.n} of {weeks.length}</div>
        <h1>{week.title}</h1>
        <div className="meta-row">
          {week.coreTime ? <span className="tag">Core {week.coreTime}</span> : null}
          <span className="tag">{week.videoCount} videos</span>
          <span className="tag">{week.doneWhen.length} criteria</span>
        </div>
        <p className="focus">
          <strong>Official focus.</strong> <span dangerouslySetInnerHTML={{ __html: week.focus }} />
        </p>
        <p className="muted small">
          <strong>Sessions.</strong> <span dangerouslySetInnerHTML={{ __html: week.sessions }} />
        </p>
      </header>

      <article className="prose" dangerouslySetInnerHTML={{ __html: week.html }} />

      <DoneWhen week={week.n} items={week.doneWhen} />

      <nav className="pager" aria-label="Week navigation">
        {prev ? (
          <Link href={`/week/${prev.n}`} className="btn">
            ‹ Week {prev.n}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/week/${next.n}`} className="btn btn-primary">
            Week {next.n} ›
          </Link>
        ) : (
          <Link href="/capstone" className="btn btn-primary">
            Capstone ›
          </Link>
        )}
      </nav>
    </>
  );
}
