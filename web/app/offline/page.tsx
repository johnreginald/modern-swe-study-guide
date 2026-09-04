import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <>
      <header className="page-head">
        <h1>You are offline</h1>
        <p className="muted">
          This page was not saved for offline use yet. Pages you have opened before are still available.
        </p>
      </header>
      <div className="hero-actions">
        <Link href="/" className="btn btn-primary">
          Home
        </Link>
        <Link href="/weeks" className="btn">
          Weeks
        </Link>
      </div>
    </>
  );
}
