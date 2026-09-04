import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import MarkdownIt from "markdown-it";

export type HomeSection = { id: string; title: string; html: string };

export type Week = {
  n: number;
  title: string;
  focus: string;
  sessions: string;
  coreTime: string | null;
  html: string;
  doneWhen: string[];
  videoCount: number;
};

export type Section = { title: string; html: string };

export type Guide = {
  title: string;
  updated: string;
  introHtml: string;
  home: HomeSection[];
  weeks: Week[];
  capstone: Section;
  bookshelf: Section;
  halfTime: Section;
  linkCount: number;
};

const md = new MarkdownIt({ html: false, linkify: false, typographer: false });

const defaultLinkOpen =
  md.renderer.rules.link_open ??
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const href = String(token.attrGet("href") ?? "");
  if (/^https?:\/\//.test(href)) {
    token.attrSet("target", "_blank");
    token.attrSet("rel", "noopener noreferrer");
    if (/youtube\.com|youtu\.be/.test(href)) token.attrJoin("class", "yt");
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

const SLUGS: Record<string, string> = {
  "How to use this guide": "how-to-use",
  "Coverage audit": "coverage",
  "Official 2026 schedule and guest lineup": "schedule",
  "Reusing the public 2025 course material": "reuse-2025",
};

function slugify(text: string): string {
  return SLUGS[text] ?? text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type RawSection = { heading: string; lines: string[] };

function splitSections(lines: string[]): { preamble: string[]; sections: RawSection[] } {
  const preamble: string[] = [];
  const sections: RawSection[] = [];
  let current: RawSection | null = null;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      current = { heading: line.slice(3).trim(), lines: [] };
      sections.push(current);
      continue;
    }
    if (current) current.lines.push(line);
    else preamble.push(line);
  }
  return { preamble, sections };
}

function stripRules(lines: string[]): string[] {
  return lines.filter((l) => l.trim() !== "---");
}

function takeLine(lines: string[], prefix: string): string {
  const idx = lines.findIndex((l) => l.startsWith(prefix));
  if (idx === -1) return "";
  const [line] = lines.splice(idx, 1);
  return md.renderInline(line.slice(prefix.length).trim());
}

function extractDoneWhen(lines: string[]): string[] {
  const start = lines.findIndex((l) => l.trim() === "### Done when");
  if (start === -1) return [];
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith("#")) {
      end = i;
      break;
    }
  }
  const block = lines.splice(start, end - start);
  return block
    .filter((l) => l.startsWith("- "))
    .map((l) => md.renderInline(l.slice(2).trim()));
}

function parseWeek(section: RawSection): Week {
  const match = /^Week (\d+) — (.+)$/.exec(section.heading);
  if (!match) throw new Error(`Not a week heading: ${section.heading}`);
  const lines = stripRules([...section.lines]);
  const focus = takeLine(lines, "**Official focus:**");
  const sessions = takeLine(lines, "**Official sessions:**");
  const doneWhen = extractDoneWhen(lines);
  const coreHeading = lines.find((l) => l.startsWith("### Core material"));
  const coreTime = coreHeading ? (/\((≈?\s*[^)]+)\)/.exec(coreHeading)?.[1] ?? null) : null;
  const body = lines.join("\n");
  const videoCount = (body.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//g) ?? []).length;
  return {
    n: Number(match[1]),
    title: match[2].trim(),
    focus,
    sessions,
    coreTime,
    html: md.render(body),
    doneWhen,
    videoCount,
  };
}

function parseGuide(source: string): Guide {
  const lines = source.split(/\r?\n/);
  const title = (lines.find((l) => l.startsWith("# ")) ?? "# Guide").slice(2).trim();
  const updated = (lines.find((l) => l.startsWith("Updated ")) ?? "").replace(/^Updated\s+/, "").trim();
  const { preamble, sections } = splitSections(lines);
  const introLines = stripRules(preamble).filter((l) => !l.startsWith("# ") && !l.startsWith("Updated "));

  const home: HomeSection[] = [];
  const weeks: Week[] = [];
  let capstone: Section | null = null;
  let bookshelf: Section | null = null;
  let halfTime: Section | null = null;

  for (const section of sections) {
    if (/^Week \d+ — /.test(section.heading)) {
      weeks.push(parseWeek(section));
      continue;
    }
    const html = md.render(stripRules(section.lines).join("\n"));
    const entry = { title: section.heading, html };
    if (section.heading === "Suggested capstone") capstone = entry;
    else if (section.heading === "The short bookshelf") bookshelf = entry;
    else if (section.heading === "If you only have half the time") halfTime = entry;
    else home.push({ id: slugify(section.heading), ...entry });
  }

  if (!capstone || !bookshelf || !halfTime) throw new Error("Guide is missing a closing section");
  weeks.sort((a, b) => a.n - b.n);

  return {
    title,
    updated,
    introHtml: md.render(introLines.join("\n")),
    home,
    weeks,
    capstone,
    bookshelf,
    halfTime,
    linkCount: new Set(source.match(/\]\((https?:\/\/[^)]+)\)/g) ?? []).size,
  };
}

let cached: Guide | null = null;

export function getGuide(): Guide {
  if (cached) return cached;
  const source = readFileSync(resolve(process.cwd(), "content", "guide.md"), "utf8");
  cached = parseGuide(source);
  return cached;
}

export function getWeek(n: number): Week | undefined {
  return getGuide().weeks.find((w) => w.n === n);
}
