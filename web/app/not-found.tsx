import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <header className="page-head">
        <h1>Not found</h1>
        <p className="muted">That page does not exist in the guide.</p>
      </header>
      <div className="hero-actions">
        <Link href="/" className="btn btn-primary">
          Home
        </Link>
      </div>
    </>
  );
}
