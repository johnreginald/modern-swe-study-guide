"use client";

import { useEffect, useState } from "react";
import { PROGRESS_EVENT, countDone } from "@/lib/progress";

export type WeekMeta = { n: number; total: number };

function useProgress(weeks: WeekMeta[]): number[] {
  const [done, setDone] = useState<number[]>(() => weeks.map(() => 0));
  const key = weeks.map((w) => `${w.n}:${w.total}`).join(",");
  useEffect(() => {
    const refresh = () => setDone(weeks.map((w) => countDone(w.n, w.total)));
    refresh();
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return done;
}

function fill(template: string, vars: Record<string, number>): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

type OverallProps = { weeks: WeekMeta[]; title: string; summary: string };

export function OverallProgress({ weeks, title, summary }: OverallProps) {
  const done = useProgress(weeks);
  const total = weeks.reduce((s, w) => s + w.total, 0);
  const sum = done.reduce((s, d) => s + d, 0);
  const pct = total ? Math.round((sum / total) * 100) : 0;
  const weeksDone = weeks.filter((w, i) => w.total > 0 && done[i] === w.total).length;
  return (
    <div className="progress-card">
      <div className="progress-row">
        <strong>{title}</strong>
        <span>{fill(summary, { weeksDone, weeks: weeks.length, done: sum, total })}</span>
      </div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function WeekBadge({ week, doneLabel }: { week: WeekMeta; doneLabel: string }) {
  const [done] = useProgress([week]);
  const complete = week.total > 0 && done === week.total;
  return <span className={`pill ${complete ? "pill-done" : ""}`}>{complete ? doneLabel : `${done}/${week.total}`}</span>;
}
