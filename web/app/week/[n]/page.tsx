import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, getWeek } from "@/lib/guide";
import DoneWhen from "@/components/DoneWhen";
import { Blocks, JumpChips } from "@/components/Blocks";

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
        <div className="eyebrow">
          Week {week.n} of {weeks.length}
        </div>
        <h1>{week.title}</h1>
        <div className="meta-row">
          {week.coreTime ? <span className="tag">Core {week.coreTime}</span> : null}
          <span className="tag">{week.videoCount} videos</span>
          <span className="tag">{week.doneWhen.length} criteria</span>
        </div>
        <p className="focus">
          <span className="focus-label">Focus</span>
          <span dangerouslySetInnerHTML={{ __html: week.focus }} />
        </p>
        {week.build ? (
          <p className="focus">
            <span className="focus-label">You build</span>
            <span>{week.build}</span>
          </p>
        ) : null}
      </header>

      <JumpChips blocks={week.blocks} extra={[{ id: `done-when-${week.n}`, title: "Done when" }]} />

      <Blocks blocks={week.blocks} />

      <DoneWhen week={week.n} items={week.doneWhen} />

      <nav className="pager" aria-label="Week navigation">
        {prev ? (
          <Link href={`/week/${prev.n}`} className="btn">
            ‹ Week {prev.n}
          </Link>
        ) : (
          <Link href="/" className="btn">
            ‹ Home
          </Link>
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
