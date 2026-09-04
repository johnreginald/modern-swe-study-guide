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
            <span className="muted small">Five books behind the course</span>
          </Link>
        </li>
        <li>
          <Link href="/half-time">
            <strong>If you only have half the time</strong>
            <span className="muted small">The minimum path</span>
          </Link>
        </li>
        <li>
          <Link href="/#schedule">
            <strong>Official 2026 schedule</strong>
            <span className="muted small">Tue/Thu sessions and guests</span>
          </Link>
        </li>
        <li>
          <Link href="/#reuse-2025">
            <strong>Public 2025 assignments</strong>
            <span className="muted small">Which week each one fits</span>
          </Link>
        </li>
        <li>
          <a href="/cs146s-2026-self-study-guide.pdf" target="_blank" rel="noopener noreferrer">
            <strong>Download the PDF</strong>
            <span className="muted small">28 pages, same content</span>
          </a>
        </li>
        <li>
          <a href="https://themodernsoftware.dev/" target="_blank" rel="noopener noreferrer">
            <strong>Official course site</strong>
            <span className="muted small">themodernsoftware.dev</span>
          </a>
        </li>
      </ul>

      <section className="home-section">
        <h2>Progress</h2>
        <p className="muted small">
          Ticked criteria are stored only in this browser. Nothing is sent anywhere.
        </p>
        <ResetProgress weeks={guide.weeks.map((w) => w.n)} />
      </section>

      <section className="home-section">
        <h2>About</h2>
        <p className="muted small">
          Independent companion to Stanford CS146S, not affiliated with the course. Updated {guide.updated}. Installable
          as an app; works offline after the first visit.
        </p>
      </section>
    </>
  );
}
