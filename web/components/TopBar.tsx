"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/weeks", label: "Weeks" },
  { href: "/capstone", label: "Capstone" },
  { href: "/more", label: "More" },
] as const;

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/weeks") return pathname.startsWith("/weeks") || pathname.startsWith("/week/");
  if (href === "/more") return ["/more", "/bookshelf", "/half-time"].some((p) => pathname.startsWith(p));
  return pathname.startsWith(href);
}

export default function TopBar() {
  const pathname = usePathname();
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="Agent Engineer Study Guide 2026, home">
          <span className="brand-mark" aria-hidden="true">
            AE
          </span>
          <span className="brand-text">Agent Engineer Guide</span>
        </Link>
        <nav className="topnav" aria-label="Sections">
          {links.map((l) => {
            const active = isActive(l.href, pathname);
            return (
              <Link key={l.href} href={l.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
