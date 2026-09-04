import Link from "next/link";
import { getGuide } from "@/lib/guide";
import { OverallProgress } from "@/components/Progress";
import { Blocks } from "@/components/Blocks";
import InstallHint from "@/components/InstallHint";

export default function HomePage() {
  const guide = getGuide();
  const weeks = guide.weeks.map((w) => ({ n: w.n, total: w.doneWhen.length }));
  const sections = guide.home.filter((s) => s.id !== "at-a-glance");
  return (
    <>
      <header className="hero">
        <div className="eyebrow">Ten weeks · project-based</div>
        <h1>Agent Engineer</h1>
        <p className="hero-sub">Study Guide 2026</p>
        <p className="muted small">
          Updated {guide.updated} · {guide.linkCount} checked links
        </p>
        <div className="hero-actions">
          <Link href="/week/1" className="btn btn-primary">
            Start Week 1
          </Link>
          <Link href="/weeks" className="btn">
            All weeks
          </Link>
        </div>
      </header>

      <InstallHint />

      <OverallProgress weeks={weeks} />

      <Blocks blocks={guide.intro} />

      <section id="at-a-glance" className="home-section">
        <h2>The ten weeks at a glance</h2>
        <ol className="week-list">
          {guide.weeks.map((w) => (
            <li key={w.n}>
              <Link href={`/week/${w.n}`}>
                <span className="week-num">{w.n}</span>
                <span className="week-text">
                  <span className="week-title">{w.title}</span>
                  {w.build ? <span className="muted small">{w.build}</span> : null}
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
    </>
  );
}
