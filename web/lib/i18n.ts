import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import en from "./ui-strings.en.json";

export type Lang = "en" | "my";
export const LANGS: readonly Lang[] = ["en", "my"] as const;

type Dict = Record<string, string>;

let myDict: Dict | null | undefined;

function loadMy(): Dict | null {
  if (myDict !== undefined) return myDict;
  const p = resolve(process.cwd(), "content", "ui.my.json");
  myDict = existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as Dict) : null;
  return myDict;
}

/** True when both the translated guide and the translated UI strings are present. */
export function hasBurmese(): boolean {
  return existsSync(resolve(process.cwd(), "content", "guide.my.md")) && loadMy() !== null;
}

export function dict(lang: Lang): Dict {
  if (lang === "my") return loadMy() ?? (en as Dict);
  return en as Dict;
}

/** Translate a UI string with `{var}` substitution; falls back to English, then to the key. */
export function t(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let s = dict(lang)[key] ?? (en as Dict)[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

export function prefix(lang: Lang): string {
  return lang === "my" ? "/my" : "";
}

/** Build a language-aware path: href("my", "/weeks") → "/my/weeks", href("my", "/") → "/my". */
export function href(lang: Lang, path: string): string {
  if (lang === "en") return path;
  return path === "/" ? "/my" : `/my${path}`;
}

/** Pick a subset of strings to hand to a client component. */
export function pick(lang: Lang, keys: string[]): Dict {
  const out: Dict = {};
  for (const k of keys) out[k] = t(lang, k);
  return out;
}
