"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/weeks") return pathname.startsWith("/weeks") || pathname.startsWith("/week/");
  if (href === "/more") return ["/more", "/bookshelf", "/half-time"].some((p) => pathname.startsWith(p));
  return pathname.startsWith(href);
}

const items = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/weeks", label: "Weeks", icon: "▦" },
  { href: "/capstone", label: "Capstone", icon: "◆" },
  { href: "/more", label: "More", icon: "…" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map((item) => {
        const active = isActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
