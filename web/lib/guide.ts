import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import MarkdownIt from "markdown-it";

export type Block = { id: string; title: string; time: string | null; html: string };

export type HomeSection = { id: string; title: string; blocks: Block[] };

export type Week = {
  n: number;
  title: string;
  focus: string;
  coreTime: string | null;
  blocks: Block[];
  doneWhen: string[];
  videoCount: number;
  build: string;
};

export type Section = { title: string; blocks: Block[] };

export type Guide = {
  title: string;
  updated: string;
  intro: Block[];
  home: HomeSection[];
  weeks: Week[];
  capstone: Section;
  bookshelf: Section;
  halfTime: Section;
  linkCount: number;
};

/* ---------- markdown-it with external-link handling ---------- */

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
    if (isVideo(href)) token.attrJoin("class", "yt");
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

function isVideo(href: string): boolean {
  return /youtube\.com|youtu\.be|ai\.engineer\/talks/.test(href);
}

const inline = (text: string) => md.renderInline(text);
const escape = (text: string) => md.utils.escapeHtml(text);

/* ---------- helpers ---------- */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const SECTION_IDS: Record<string, string> = {
  "How to use this guide": "how-to-use",
  "The ten weeks at a glance": "at-a-glance",
};

type Kind = "video" | "course" | "article" | "book" | "docs" | "tool" | "paper" | "note";

function kindFor(label: string): Kind {
  const l = label.toLowerCase();
  if (/video|talk|keynote|podcast|workshop|interview|webinar|long form|explainer|synthesis|counterargument|thesis|perspective|playbook|hands-on|practical sandboxing|lab companion/.test(l))
    return "video";
  if (/course|unit|evals course|mcp video course|free courses/.test(l)) return "course";
  if (/book/.test(l)) return "book";
  if (/spec|documentation|docs|standard|reference|integrations|the products|orchestration/.test(l)) return "docs";
  if (/tool|sast|gateways|internal registries|observability|controlled|benchmarks|web skills tooling/.test(l)) return "tool";
  if (/paper|research|evidence|study/.test(l)) return "paper";
  if (/article|engineering|essay|case study|primer|framing|exploit|threat|architecture|authorization|guide|review architecture|what automation|measuring|coding-agent|agent-specific|real exploit|canonical|free book|adoption/.test(l))
    return "article";
  return "note";
}

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/;
const DURATION_RE = /^\s*\(((?:≈\s*)?[^)]*?(?:\d+\s*(?:h|min)|h\b)[^)]*)\)/;

/** Render one list item as a resource card when it has a link; plain otherwise. */
function renderItem(text: string, index: number | null): string {
  const labelMatch = /^\*\*([^*]+?):\*\*\s*([\s\S]*)$/.exec(text);
  const label = labelMatch ? labelMatch[1].trim() : null;
  const rest = labelMatch ? labelMatch[2] : text;
  const link = LINK_RE.exec(rest);

  if (!link) {
    const body = label ? `<strong class="item-label">${inline(label)}.</strong> ${inline(rest)}` : inline(text);
    return `<li class="res res-plain">${index !== null ? `<span class="res-index">${index}</span>` : ""}<div>${body}</div></li>`;
  }

  const [full, title, href] = link;
  const lead = rest.slice(0, link.index).replace(/[\s,:–—-]+$/g, "").trim();
  let after = rest.slice((link.index ?? 0) + full.length);
  let duration: string | null = null;
  const dur = DURATION_RE.exec(after);
  if (dur) {
    duration = dur[1].replace(/^≈\s*/, "≈ ").trim();
    after = after.slice(dur[0].length);
  }
  after = after.replace(/^[\s,]*[—–-]\s*/, "").trim();
  if (/^[a-z]/.test(after)) after = after[0].toUpperCase() + after.slice(1);
  const kind: Kind = label ? kindFor(label) : isVideo(href) ? "video" : "article";
  const video = isVideo(href);
  const kindLabel = label ?? (video ? "Video" : "Link");

  return [
    `<li class="res res-${kind}">`,
    index !== null ? `<span class="res-index">${index}</span>` : "",
    `<div class="res-body">`,
    `<div class="res-top"><span class="kind">${inline(kindLabel)}</span>${duration ? `<span class="dur">${escape(duration)}</span>` : ""}</div>`,
    `<a class="res-title${video ? " yt" : ""}" href="${escape(href)}" target="_blank" rel="noopener noreferrer">${inline(title)}</a>`,
    lead ? `<div class="res-by">${inline(lead)}</div>` : "",
    after ? `<p class="res-desc">${inline(after)}</p>` : "",
    `</div></li>`,
  ].join("");
}

/**
 * Turn the lines of one section into blocks: each `###` heading opens a block; lists become
 * resource cards; paragraphs, tables, and code lines render through markdown-it.
 */
function renderBlocks(lines: string[], fallbackTitle: string): Block[] {
  const blocks: Block[] = [];
  let current: Block & { parts: string[]; list: { ordered: boolean; items: string[] } | null } = {
    id: slugify(fallbackTitle),
    title: "", // untitled lead block: the page heading already names it
    time: null,
    html: "",
    parts: [],
    list: null,
  };
  let para: string[] = [];
  let table: string[] = [];

  const flushPara = () => {
    if (para.length) {
      current.parts.push(md.render(para.join("\n")));
      para = [];
    }
  };
  const flushTable = () => {
    if (table.length) {
      current.parts.push(`<div class="table-wrap">${md.render(table.join("\n"))}</div>`);
      table = [];
    }
  };
  const flushList = () => {
    if (current.list) {
      const { ordered, items } = current.list;
      const tag = ordered ? "ol" : "ul";
      current.parts.push(
        `<${tag} class="resources">${items.map((t, i) => renderItem(t, ordered ? i + 1 : null)).join("")}</${tag}>`,
      );
      current.list = null;
    }
  };
  const flushAll = () => {
    flushPara();
    flushTable();
    flushList();
  };
  const closeBlock = () => {
    flushAll();
    if (current.parts.length) blocks.push({ id: current.id, title: current.title, time: current.time, html: current.parts.join("") });
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith("|")) {
      flushPara();
      flushList();
      table.push(trimmed);
      continue;
    }
    flushTable();

    if (trimmed.startsWith("### ")) {
      closeBlock();
      const heading = trimmed.slice(4).trim();
      const time = /\((≈?\s*[^)]+)\)\s*$/.exec(heading)?.[1]?.replace(/^≈\s*/, "≈ ") ?? null;
      const title = heading.replace(/\s*\(.*\)\s*$/, "");
      current = { id: slugify(title), title, time, html: "", parts: [], list: null };
      continue;
    }
    if (!trimmed || trimmed === "---") {
      flushPara();
      flushList();
      continue;
    }
    const li = /^(?:-\s+|(\d+)\.\s+)(.*)$/.exec(trimmed);
    if (li) {
      flushPara();
      const ordered = li[1] !== undefined;
      if (!current.list || current.list.ordered !== ordered) {
        flushList();
        current.list = { ordered, items: [] };
      }
      current.list.items.push(li[2]);
      continue;
    }
    if (/^`[^`]+`$/.test(trimmed)) {
      flushAll();
      current.parts.push(`<pre class="pipeline"><code>${escape(trimmed.slice(1, -1))}</code></pre>`);
      continue;
    }
    flushList();
    para.push(line);
  }
  closeBlock();
  return blocks;
}

/* ---------- section splitting ---------- */

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

function takeLine(lines: string[], prefix: string): string {
  const idx = lines.findIndex((l) => l.startsWith(prefix));
  if (idx === -1) return "";
  const [line] = lines.splice(idx, 1);
  return inline(line.slice(prefix.length).trim());
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
  return block.filter((l) => l.startsWith("- ")).map((l) => inline(l.slice(2).trim()));
}

function parseWeek(section: RawSection, glance: Map<number, string>): Week {
  const match = /^Week (\d+) — (.+)$/.exec(section.heading);
  if (!match) throw new Error(`Not a week heading: ${section.heading}`);
  const n = Number(match[1]);
  const lines = [...section.lines];
  const focus = takeLine(lines, "**Focus:**");
  const doneWhen = extractDoneWhen(lines);
  const body = lines.join("\n");
  const videoCount = (body.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//g) ?? []).length;
  const blocks = renderBlocks(lines, section.heading);
  const core = blocks.find((b) => b.title.startsWith("Core material"));
  return {
    n,
    title: match[2].trim(),
    focus,
    coreTime: core?.time ?? null,
    blocks,
    doneWhen,
    videoCount,
    build: glance.get(n) ?? "",
  };
}

function parseGlance(lines: string[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const line of lines) {
    const m = /^\|\s*(\d+)\s*\|[^|]*\|\s*([^|]+?)\s*\|$/.exec(line.trim());
    if (m) map.set(Number(m[1]), m[2]);
  }
  return map;
}

function parseGuide(source: string): Guide {
  const lines = source.split(/\r?\n/);
  const title = (lines.find((l) => l.startsWith("# ")) ?? "# Guide").slice(2).trim();
  const updated = (lines.find((l) => l.startsWith("Updated ")) ?? "").replace(/^Updated\s+/, "").trim();
  const { preamble, sections } = splitSections(lines);
  const introLines = preamble.filter((l) => !l.startsWith("# ") && !l.startsWith("Updated "));

  const glanceSection = sections.find((s) => s.heading === "The ten weeks at a glance");
  const glance = glanceSection ? parseGlance(glanceSection.lines) : new Map<number, string>();

  const home: HomeSection[] = [];
  const weeks: Week[] = [];
  let capstone: Section | null = null;
  let bookshelf: Section | null = null;
  let halfTime: Section | null = null;

  for (const section of sections) {
    if (/^Week \d+ — /.test(section.heading)) {
      weeks.push(parseWeek(section, glance));
      continue;
    }
    const blocks = renderBlocks(section.lines, section.heading);
    const entry = { title: section.heading, blocks };
    if (section.heading === "Suggested capstone") capstone = entry;
    else if (section.heading === "The short bookshelf") bookshelf = entry;
    else if (section.heading === "If you only have half the time") halfTime = entry;
    else home.push({ id: SECTION_IDS[section.heading] ?? slugify(section.heading), ...entry });
  }

  if (!capstone || !bookshelf || !halfTime) throw new Error("Guide is missing a closing section");
  weeks.sort((a, b) => a.n - b.n);

  return {
    title,
    updated,
    intro: renderBlocks(introLines, "Introduction"),
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
