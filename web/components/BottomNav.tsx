"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive } from "@/components/TopBar";

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
