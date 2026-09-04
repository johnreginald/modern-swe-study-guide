import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import MarkdownIt from "markdown-it";
import type { Lang } from "./i18n";

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
  lang: Lang;
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

let currentLang: Lang = "en";
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
const DURATION_RE = /^\s*\(((?:≈\s*)?[^)]*?\d[^)]*)\)/;

const DIGITS = /[0-9၀-၉]/;

function kindFromMeta(text: string, href: string | null): Kind {
  const t = text.toLowerCase();
  if (/ဗီဒီယို|video|talk|keynote|podcast|workshop|webinar|interview/.test(t)) return "video";
  if (/course|unit|သင်တန်း|academy/.test(t)) return "course";
  if (/book|စာအုပ်/.test(t)) return "book";
  if (/spec|documentation|docs|integrations|standard|reference/.test(t)) return "docs";
  if (/research|သုတေသန|paper|report/.test(t)) return "paper";
  if (/ဆောင်းပါး|article|case study|essay|guide|လမ်းညွှန်|pdf|blog/.test(t)) return "article";
  if (href && isVideo(href)) return "video";
  return href ? "article" : "note";
}

/** Approved Burmese item layout: `**Title** *(kind · duration - author):* description`. */
function renderTitledItem(text: string, index: number | null): string | null {
  const m = /^\*\*(.+?)\*\*\s*(?:\*\((.+?)\):?\*\s*|:\s*)?([\s\S]*)$/.exec(text);
  if (!m) return null;
  let title = m[1].trim().replace(/:$/, "");
  const meta = (m[2] ?? "").trim();
  const desc = m[3].trim().replace(/^[:\s]+/, "");
  const link = LINK_RE.exec(title);
  const href = link ? link[2] : null;
  const metaParts = meta ? meta.split("·").map((p) => p.trim()).filter(Boolean) : [];
  let duration: string | null = null;
  let author: string | null = null;
  const kindParts: string[] = [];
  for (const part of metaParts) {
    const dash = part.split(/\s+-\s+/);
    const head = dash[0].trim();
    if (dash.length > 1) author = dash.slice(1).join(" - ").trim();
    if (DIGITS.test(head) && /မိနစ်|နာရီ|min|\bh\b/.test(head)) duration = head;
    else if (head && !DIGITS.test(head)) kindParts.push(head);
    else if (head) duration = head;
  }
  if (!meta && !href) {
    return `<li class="res res-plain">${index !== null ? `<span class="res-index">${index}</span>` : ""}<div><strong class="item-label">${inline(title)}.</strong> ${inline(desc)}</div></li>`;
  }
  const kind = kindFromMeta(kindParts.join(" "), href);
  const kindLabel = kindParts.join(" · ") || (href && isVideo(href) ? "ဗီဒီယို" : "");
  const video = href ? isVideo(href) : false;
  const titleHtml = inline(title);
  return [
    `<li class="res res-${kind}">`,
    index !== null ? `<span class="res-index">${index}</span>` : "",
    `<div class="res-body">`,
    kindLabel || duration
      ? `<div class="res-top">${kindLabel ? `<span class="kind">${escape(kindLabel)}</span>` : ""}${duration ? `<span class="dur">${escape(duration)}</span>` : ""}</div>`
      : "",
    href
      ? `<span class="res-title${video ? " yt" : ""}">${titleHtml}</span>`
      : `<span class="res-title res-title-plain">${titleHtml}</span>`,
    author ? `<div class="res-by">${inline(author)}</div>` : "",
    desc ? `<p class="res-desc">${inline(desc)}</p>` : "",
    `</div></li>`,
  ].join("");
}

/** Render one list item as a resource card when it has a link; plain otherwise. */
function renderItem(text: string, index: number | null, kindHint?: Kind): string {
  if (currentLang === "my") {
    const titled = renderTitledItem(text, index);
    if (titled) return titled;
    return `<li class="res res-plain">${index !== null ? `<span class="res-index">${index}</span>` : ""}<div>${inline(text)}</div></li>`;
  }
  const labelMatch = /^\*\*([^*]+?)(?:\s*\([^)]*\))?:\*\*\s*([\s\S]*)$/.exec(text);
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
  const video = isVideo(href);
  const kind: Kind = kindHint ?? (label ? kindFor(label) : video ? "video" : "article");
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

type BlockTemplate = { ids: string[]; kinds: (Kind | undefined)[][] } | null;

/**
 * Turn the lines of one section into blocks: each `###` heading opens a block; lists become
 * resource cards; paragraphs, tables, and code lines render through markdown-it.
 * `template` (from the English guide) supplies stable ids and card kinds for translations,
 * whose headings and labels are not English.
 */
function renderBlocks(lines: string[], fallbackTitle: string, template: BlockTemplate = null): Block[] {
  const blocks: Block[] = [];
  type Cur = Block & { parts: string[]; list: { ordered: boolean; items: string[] } | null; itemNo: number };
  const idFor = (title: string): string => {
    const t = title.toLowerCase();
    if (/core|အဓိက လေ့လာစရာ/.test(t)) return "core-material";
    if (/deeper|ပိုလေ့လာ/.test(t)) return "deeper-material";
    if (/video track|ဗီဒီယိုများ/.test(t)) return "additional-video-track";
    if (/^build$|\(build\)|တည်ဆောက်ရန်/.test(t)) return "build";
    if (/tools|references/.test(t)) return "tools-and-references";
    if (/optional|ထပ်ဖြည့်/.test(t)) return "optional-foundation";
    if (/deliverables|တင်ပြရမည့်/.test(t)) return "deliverables";
    return slugify(title) || slugify(fallbackTitle) || `b${blocks.length}`;
  };
  const newBlock = (title: string, time: string | null): Cur => ({
    id: template?.ids[blocks.length] ?? idFor(title),
    title,
    time,
    html: "",
    parts: [],
    list: null,
    itemNo: 0,
  });
  let current = newBlock("", null); // untitled lead block: the page heading already names it
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
      const kinds = template?.kinds[blocks.length];
      const base = current.itemNo;
      current.parts.push(
        `<${tag} class="resources">${items.map((t, i) => renderItem(t, ordered ? i + 1 : null, kinds?.[base + i])).join("")}</${tag}>`,
      );
      current.itemNo += items.length;
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
      let time = /\(([^)]*[0-9၀-၉][^)]*)\)\s*$/.exec(heading)?.[1]?.replace(/^≈\s*/, "≈ ") ?? null;
      let title = time ? heading.replace(/\s*\([^)]*\)\s*$/, "") : heading;
      const approx = /^(.*?)\s*≈\s*([0-9၀-၉].*)$/.exec(title);
      if (!time && approx) {
        title = approx[1].trim();
        time = `≈ ${approx[2].trim()}`;
      }
      current = newBlock(title, time);
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

/** Card kinds per block per list item, derived from the English labels; reused for translations. */
function kindTemplate(lines: string[]): (Kind | undefined)[][] {
  const out: (Kind | undefined)[][] = [];
  let cur: (Kind | undefined)[] = [];
  let sawHeading = false;
  let leadHasContent = false;
  for (const raw of lines) {
    const t = raw.trim();
    if (t.startsWith("### ")) {
      if (sawHeading || leadHasContent) out.push(cur);
      cur = [];
      sawHeading = true;
      continue;
    }
    if (!t || t === "---") continue;
    if (!sawHeading) leadHasContent = true;
    const li = /^(?:-\s+|\d+\.\s+)(.*)$/.exec(t);
    if (li) {
      const label = /^\*\*([^*]+?):\*\*/.exec(li[1])?.[1];
      const link = LINK_RE.exec(li[1]);
      cur.push(label ? kindFor(label) : link ? (isVideo(link[2]) ? "video" : "article") : undefined);
    }
  }
  out.push(cur);
  return out;
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

/** First bold-label paragraph line before the first `###` (the Focus line), removed from `lines`. */
function takeLabeled(lines: string[]): string {
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith("#")) break;
    const m = /^\*\*[^*]+:\*\*\s*(.*)$/.exec(lines[i]);
    if (m) {
      if (m[1].trim()) {
        lines.splice(i, 1);
        return inline(m[1].trim());
      }
      // Label alone on the line: the text is the next non-empty line.
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j += 1;
      if (j < lines.length && !lines[j].startsWith("#")) {
        const text = lines[j].trim();
        lines.splice(i, j - i + 1);
        return inline(text);
      }
      lines.splice(i, 1);
      return "";
    }
  }
  return "";
}

const takeFocus = takeLabeled;

/** Index (among `###` headings) of the "Done when" block, or -1. */
function doneWhenIndex(lines: string[]): number {
  let i = -1;
  for (const l of lines) {
    if (l.startsWith("### ")) {
      i += 1;
      if (/^### (Done when|.*\(Done When.*\)|ပြီးစီးကြောင်း)/i.test(l)) return i;
    }
  }
  return -1;
}

/** Remove the `h3Index`-th `###` block from `lines` and return its bullet items. */
function extractDoneWhenAt(lines: string[], h3Index: number): string[] {
  if (h3Index < 0) return [];
  let seen = -1;
  let start = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith("### ")) {
      seen += 1;
      if (seen === h3Index) {
        start = i;
        break;
      }
    }
  }
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

type WeekTemplate = { n: number; doneWhenIdx: number; blocks: BlockTemplate } | null;

function parseWeek(section: RawSection, glance: Map<number, string>, tpl: WeekTemplate): { week: Week; doneWhenIdx: number; bodyLines: string[] } {
  const lines = [...section.lines];
  const n = tpl?.n ?? Number(/^Week (\d+)/.exec(section.heading)?.[1]);
  if (!Number.isFinite(n)) throw new Error(`Not a week heading: ${section.heading}`);
  const title = section.heading.includes("—") ? section.heading.split("—").slice(1).join("—").trim() : section.heading;
  const focus = takeFocus(lines);
  const buildSummary = takeLabeled(lines); // second labelled paragraph in the approved Burmese layout; empty for English
  const dwIdx = tpl ? tpl.doneWhenIdx : doneWhenIndex(lines);
  const doneWhen = extractDoneWhenAt(lines, dwIdx);
  const body = lines.join("\n");
  const videoCount = (body.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//g) ?? []).length;
  const blocks = renderBlocks(lines, section.heading, tpl?.blocks ?? null);
  const core = blocks.find((b, i) => (tpl ? tpl.blocks?.ids[i] === "core-material" : /core/i.test(b.title)));
  return {
    week: { n, title, focus, coreTime: core?.time ?? null, blocks, doneWhen, videoCount, build: glance.get(n) || buildSummary },
    doneWhenIdx: dwIdx,
    bodyLines: lines,
  };
}

function parseGlance(lines: string[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const line of lines) {
    const row = /^\|\s*(\d+)\s*\|[^|]*\|\s*([^|]+?)\s*\|$/.exec(line.trim());
    if (row) map.set(Number(row[1]), inline(row[2]));
    const bullet = /^-\s+\*\*(\d+)\.\s+[^*]+\*\*\s*(.*)$/.exec(line.trim());
    if (bullet) map.set(Number(bullet[1]), inline(bullet[2].trim()));
  }
  return map;
}

type Role = { kind: "home" | "week" | "capstone" | "bookshelf" | "halfTime" | "glance"; n?: number; id?: string };

/** Per-section structure of the English guide, used to interpret a translated copy. */
type Template = {
  roles: Role[];
  weekDoneWhen: Map<number, number>;
  blockTemplates: Map<number, BlockTemplate>; // by section index
  introBlocks: BlockTemplate;
};

function blockTemplateOf(lines: string[], blocks: Block[]): BlockTemplate {
  return { ids: blocks.map((b) => b.id), kinds: kindTemplate(lines) };
}

function roleFor(heading: string, homeIndex: number): Role {
  if (/^Week \d+ — /.test(heading)) return { kind: "week", n: Number(/^Week (\d+)/.exec(heading)![1]) };
  if (/capstone/i.test(heading)) return { kind: "capstone" };
  if (/bookshelf|စာအုပ်စင်/i.test(heading)) return { kind: "bookshelf" };
  if (/half the time|minimum path|အချိန်တစ်ဝက်/i.test(heading)) return { kind: "halfTime" };
  if (/at a glance|သင်ရိုး အကျဉ်း/i.test(heading)) return { kind: "glance", id: "at-a-glance" };
  return { kind: "home", id: SECTION_IDS[heading] ?? (slugify(heading) || (homeIndex === 0 ? "how-to-use" : `s${homeIndex}`)) };
}

function parseGuide(source: string, lang: Lang, template: Template | null): { guide: Guide; template: Template } {
  currentLang = lang;
  const lines = source.split(/\r?\n/);
  const title = (lines.find((l) => l.startsWith("# ")) ?? "# Guide").slice(2).trim();
  const { preamble, sections } = splitSections(lines);
  // The "Updated …" line is the first short non-heading line of the preamble (any language).
  const updatedIdx = preamble.findIndex((l) => l.trim() && !l.startsWith("#"));
  const updatedRaw = updatedIdx >= 0 ? preamble[updatedIdx].trim() : "";
  const updated = updatedRaw.replace(/^Updated\s+/i, "");
  const introLines = preamble.filter((l, i) => !l.startsWith("# ") && i !== updatedIdx);

  if (template && template.roles.length !== sections.length) {
    throw new Error(`Translated guide has ${sections.length} sections, English has ${template.roles.length}`);
  }

  const roles: Role[] = [];
  const weekDoneWhen = new Map<number, number>();
  const blockTemplates = new Map<number, BlockTemplate>();

  const glanceIdx = template
    ? template.roles.findIndex((r) => r.kind === "glance")
    : sections.findIndex((s) => s.heading === "The ten weeks at a glance");
  const glance = glanceIdx >= 0 ? parseGlance(sections[glanceIdx].lines) : new Map<number, string>();

  const home: HomeSection[] = [];
  const weeks: Week[] = [];
  let capstone: Section | null = null;
  let bookshelf: Section | null = null;
  let halfTime: Section | null = null;

  sections.forEach((section, si) => {
    const role: Role = template ? template.roles[si] : roleFor(section.heading, home.length);
    roles.push(role);

    if (role.kind === "week") {
      const tpl: WeekTemplate = template
        ? { n: role.n!, doneWhenIdx: template.weekDoneWhen.get(role.n!) ?? -1, blocks: template.blockTemplates.get(si) ?? null }
        : null;
      const { week, doneWhenIdx, bodyLines } = parseWeek(section, glance, tpl);
      weeks.push(week);
      weekDoneWhen.set(week.n, doneWhenIdx);
      if (!template) blockTemplates.set(si, blockTemplateOf(bodyLines, week.blocks));
      return;
    }
    const blocks = renderBlocks(section.lines, section.heading, template ? (template.blockTemplates.get(si) ?? null) : null);
    if (!template) blockTemplates.set(si, blockTemplateOf(section.lines, blocks));
    const entry = { title: section.heading, blocks };
    if (role.kind === "capstone") capstone = entry;
    else if (role.kind === "bookshelf") bookshelf = entry;
    else if (role.kind === "halfTime") halfTime = entry;
    else home.push({ id: role.id ?? `s${si}`, ...entry });
  });

  if (!capstone || !bookshelf || !halfTime) throw new Error("Guide is missing a closing section");
  weeks.sort((a, b) => a.n - b.n);

  const intro = renderBlocks(introLines, "Introduction", template ? template.introBlocks : null);
  const tpl: Template = template ?? { roles, weekDoneWhen, blockTemplates, introBlocks: blockTemplateOf(introLines, intro) };

  return {
    guide: {
      lang,
      title,
      updated,
      intro,
      home,
      weeks,
      capstone,
      bookshelf,
      halfTime,
      linkCount: new Set(source.match(/\]\((https?:\/\/[^)]+)\)/g) ?? []).size,
    },
    template: tpl,
  };
}

/* ---------- public API ---------- */

const cache = new Map<Lang, Guide>();
let englishTemplate: Template | null = null;

function contentPath(lang: Lang): string {
  return resolve(process.cwd(), "content", lang === "my" ? "guide.my.md" : "guide.md");
}

export function hasGuide(lang: Lang): boolean {
  return existsSync(contentPath(lang));
}

export function getGuide(lang: Lang = "en"): Guide {
  const hit = cache.get(lang);
  if (hit) return hit;
  if (!englishTemplate) {
    const en = parseGuide(readFileSync(contentPath("en"), "utf8"), "en", null);
    cache.set("en", en.guide);
    englishTemplate = en.template;
    if (lang === "en") return en.guide;
  }
  const parsed = parseGuide(readFileSync(contentPath(lang), "utf8"), lang, null);
  cache.set(lang, parsed.guide);
  return parsed.guide;
}

export function getWeek(n: number, lang: Lang = "en"): Week | undefined {
  return getGuide(lang).weeks.find((w) => w.n === n);
}
