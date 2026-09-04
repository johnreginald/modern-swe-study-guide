import type { Metadata } from "next";
import Link from "next/link";
import { getGuide } from "@/lib/guide";
import { OverallProgress, WeekBadge } from "@/components/Progress";

export const metadata: Metadata = { title: "Weeks" };

export default function WeeksPage() {
  const guide = getGuide();
  const meta = guide.weeks.map((w) => ({ n: w.n, total: w.doneWhen.length }));
  return (
    <>
      <header className="page-head">
        <h1>Ten weeks</h1>
        <p className="muted">Core material ≈ 3.5 h each, then the build. Tick each week’s “Done when” list to track progress.</p>
      </header>
      <OverallProgress weeks={meta} />
      <ol className="week-cards">
        {guide.weeks.map((w) => (
          <li key={w.n}>
            <Link href={`/week/${w.n}`} className="week-card">
              <div className="week-card-top">
                <span className="week-num">Week {w.n}</span>
                <WeekBadge week={{ n: w.n, total: w.doneWhen.length }} />
              </div>
              <h2>{w.title}</h2>
              {w.build ? (
                <p className="small">
                  <span className="muted">You build:</span> {w.build}
                </p>
              ) : null}
              <div className="meta-row">
                {w.coreTime ? <span className="tag">Core {w.coreTime}</span> : null}
                <span className="tag">{w.videoCount} videos</span>
                <span className="tag">{w.doneWhen.length} criteria</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
