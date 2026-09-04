import type { Metadata } from "next";
import Link from "next/link";
import { getGuide } from "@/lib/guide";
import ResetProgress from "@/components/ResetProgress";

export const metadata: Metadata = { title: "More" };

export default function MorePage() {
  const guide = getGuide();
  return (
    <>
      <header className="page-head">
        <h1>More</h1>
      </header>

      <ul className="link-list">
        <li>
          <Link href="/bookshelf">
            <strong>The short bookshelf</strong>
            <span className="muted small">Five books behind the guide</span>
          </Link>
        </li>
        <li>
          <Link href="/half-time">
            <strong>If you only have half the time</strong>
            <span className="muted small">The minimum path</span>
          </Link>
        </li>
        <li>
          <Link href="/#at-a-glance">
            <strong>The ten weeks at a glance</strong>
            <span className="muted small">Topic and build per week</span>
          </Link>
        </li>
        <li>
          <a href="/agentic-engineer-study-guide-2026.pdf" target="_blank" rel="noopener noreferrer">
            <strong>Download the PDF</strong>
            <span className="muted small">Same content, print layout</span>
          </a>
        </li>
      </ul>

      <section className="home-section">
        <h2>Progress</h2>
        <p className="muted small">Ticked criteria are stored only in this browser. Nothing is sent anywhere.</p>
        <ResetProgress weeks={guide.weeks.map((w) => w.n)} />
      </section>

      <section className="home-section">
        <h2>About</h2>
        <p className="muted small">
          Agentic Engineer Study Guide 2026 is an independent guide. Its ten-week structure follows the Fall 2026 syllabus of
          Stanford’s CS146S, <em>The Modern Software Developer</em> (
          <a href="https://themodernsoftware.dev/" target="_blank" rel="noopener noreferrer">
            themodernsoftware.dev
          </a>
          ); it is not affiliated with the course. Updated {guide.updated}. Installable as an app; works offline after the
          first visit.
        </p>
      </section>
    </>
  );
}
