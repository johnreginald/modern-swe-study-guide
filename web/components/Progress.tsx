"use client";

import { useEffect, useState } from "react";
import { PROGRESS_EVENT, countDone } from "@/lib/progress";

export type WeekMeta = { n: number; total: number };

function useProgress(weeks: WeekMeta[]): number[] {
  const [done, setDone] = useState<number[]>(() => weeks.map(() => 0));
  useEffect(() => {
    const refresh = () => setDone(weeks.map((w) => countDone(w.n, w.total)));
    refresh();
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [weeks]);
  return done;
}

export function OverallProgress({ weeks }: { weeks: WeekMeta[] }) {
  const done = useProgress(weeks);
  const total = weeks.reduce((s, w) => s + w.total, 0);
  const sum = done.reduce((s, d) => s + d, 0);
  const pct = total ? Math.round((sum / total) * 100) : 0;
  const weeksDone = weeks.filter((w, i) => w.total > 0 && done[i] === w.total).length;
  return (
    <div className="progress-card">
      <div className="progress-row">
        <strong>Your progress</strong>
        <span>
          {weeksDone}/{weeks.length} weeks · {sum}/{total} criteria
        </span>
      </div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function WeekBadge({ week }: { week: WeekMeta }) {
  const [done] = useProgress([week]);
  const complete = week.total > 0 && done === week.total;
  return (
    <span className={`pill ${complete ? "pill-done" : ""}`}>
      {complete ? "Done" : `${done}/${week.total}`}
    </span>
  );
}
