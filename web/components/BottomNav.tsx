"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Labels = { home: string; weeks: string; capstone: string; more: string };
type Props = { labels: { en: Labels; my: Labels } };

const routes = [
  { path: "/", key: "home", icon: "⌂" },
  { path: "/weeks", key: "weeks", icon: "▦" },
  { path: "/capstone", key: "capstone", icon: "◆" },
  { path: "/more", key: "more", icon: "…" },
] as const;

function isActive(path: string, rel: string): boolean {
  if (path === "/") return rel === "/";
  if (path === "/weeks") return rel.startsWith("/weeks") || rel.startsWith("/week/");
  if (path === "/more") return ["/more", "/bookshelf", "/half-time"].some((p) => rel.startsWith(p));
  return rel.startsWith(path);
}

export default function BottomNav({ labels }: Props) {
  const pathname = usePathname();
  const isMy = pathname === "/my" || pathname.startsWith("/my/");
  const rel = isMy ? pathname.slice(3) || "/" : pathname;
  const dict = isMy ? labels.my : labels.en;
  const prefix = isMy ? "/my" : "";
  return (
    <nav className={`bottom-nav${isMy ? " lang-my" : ""}`} aria-label="Primary">
      {routes.map((r) => {
        const active = isActive(r.path, rel);
        const href = r.path === "/" ? prefix || "/" : `${prefix}${r.path}`;
        return (
          <Link key={r.path} href={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
            <span className="nav-icon" aria-hidden="true">
              {r.icon}
            </span>
            <span>{dict[r.key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
