"use client";

import { useEffect, useState } from "react";
import { readWeek, writeWeek } from "@/lib/progress";

type Props = { week: number; items: string[]; title: string };

export default function DoneWhen({ week, items, title }: Props) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setChecked(readWeek(week, items.length));
    setLoaded(true);
  }, [week, items.length]);

  function toggle(i: number) {
    const next = checked.map((v, j) => (j === i ? !v : v));
    setChecked(next);
    writeWeek(week, next);
  }

  const done = checked.filter(Boolean).length;

  return (
    <section className="done-when" id={`done-when-${week}`} aria-labelledby={`done-when-title-${week}`}>
      <div className="done-when-head">
        <h3 id={`done-when-title-${week}`}>{title}</h3>
        <span className="pill" aria-live="polite">
          {done}/{items.length}
        </span>
      </div>
      <ul className="checklist">
        {items.map((html, i) => (
          <li key={i} className={checked[i] ? "is-done" : undefined}>
            <label>
              <input type="checkbox" checked={checked[i]} disabled={!loaded} onChange={() => toggle(i)} />
              <span dangerouslySetInnerHTML={{ __html: html }} />
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
