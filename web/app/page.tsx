import Link from "next/link";
import { getGuide } from "@/lib/guide";
import { OverallProgress } from "@/components/Progress";

export default function HomePage() {
  const guide = getGuide();
  const weeks = guide.weeks.map((w) => ({ n: w.n, total: w.doneWhen.length }));
  return (
    <>
      <header className="hero">
        <div className="eyebrow">Fall 2026 · independent companion</div>
        <h1>CS146S</h1>
        <p className="hero-sub">The Modern Software Developer — 2026 self-study guide</p>
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

      <OverallProgress weeks={weeks} />

      <nav className="toc" aria-label="On this page">
        {guide.home.map((s) => (
          <a key={s.id} href={`#${s.id}`}>
            {s.title}
          </a>
        ))}
      </nav>

      <article className="prose" dangerouslySetInnerHTML={{ __html: guide.introHtml }} />

      {guide.home.map((section) => (
        <section key={section.id} id={section.id} className="home-section">
          <h2>{section.title}</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: section.html }} />
        </section>
      ))}

      <section className="home-section">
        <h2>Weeks</h2>
        <ol className="week-list">
          {guide.weeks.map((w) => (
            <li key={w.n}>
              <Link href={`/week/${w.n}`}>
                <span className="week-num">{w.n}</span>
                <span className="week-title">{w.title}</span>
                <span className="chev" aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
