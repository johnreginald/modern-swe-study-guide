"use client";

import Link from "next/link";
import { rememberLang } from "@/components/LangEffect";

type Props = { lang: "en" | "my"; toEn: string; toMy: string; className?: string };

/** Two-way language toggle. Keeps the reader on the equivalent page. */
export default function LangSwitch({ lang, toEn, toMy, className }: Props) {
  const target = lang === "my" ? "/" : "/my";
  const label = lang === "my" ? toEn : toMy;
  const next = lang === "my" ? "en" : "my";
  return (
    <Link href={target} className={className ?? "btn btn-ghost lang-switch"} onClick={() => rememberLang(next)} lang={next}>
      {label}
    </Link>
  );
}
