#!/usr/bin/env node
/**
 * Burmese translation pipeline driven by the Antigravity CLI (`agy --print`).
 *
 *   node scripts/translate-my.mjs [--step glossary|ui|translate|assemble|validate|all]
 *                                 [--only 3,7] [--force] [--model "Gemini 3.1 Pro (High)"]
 *
 * Steps
 *   glossary  – ask the model for Burmese renderings of the core terms → .scratch/burmese-translation/glossary.md
 *   ui        – translate web/lib/ui-strings.en.json → web/content/ui.my.json
 *   translate – translate the guide section by section (one `##` block per call), cached per chunk
 *   assemble  – join chunks, restore URL/code placeholders → outputs/agentic-engineer-study-guide-2026.my.md
 *   validate  – re-run the structural checks on the assembled file
 *
 * Every chunk is validated (headings, list items, table rows, placeholders, Unicode-not-Zawgyi) and retried
 * with the validation errors fed back, up to three times. Nothing leaves the machine except the text sent to
 * the CLI; the CLI is the only network client.
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, "..");
const root = resolve(web, "..");
const SRC = resolve(root, "outputs", "agentic-engineer-study-guide-2026.md");
const OUT = resolve(root, "outputs", "agentic-engineer-study-guide-2026.my.md");
const WORK = resolve(root, ".scratch", "burmese-translation");
const CHUNKS = resolve(WORK, "chunks");
const GLOSSARY = resolve(WORK, "glossary.md");
const PLACEHOLDERS = resolve(WORK, "placeholders.json");
const LOG = resolve(WORK, "log.jsonl");
const UI_EN = resolve(web, "lib", "ui-strings.en.json");
const UI_MY = resolve(web, "content", "ui.my.json");

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const STEP = opt("step", "all");
const FORCE = argv.includes("--force");
const ONLY = (opt("only", "") || "").split(",").filter(Boolean).map(Number);
const MODEL = opt("model", process.env.AGY_MODEL || "Gemini 3.1 Pro (High)");
const TIMEOUT = opt("timeout", "10m");

mkdirSync(CHUNKS, { recursive: true });

/* ---------------------------------------------------------------- model call */

function log(entry) {
  appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), ...entry }) + "\n");
}

function stripFences(text) {
  let t = text.trim();
  t = t.replace(/^```(?:markdown|md|json)?\s*\n/i, "").replace(/\n```\s*$/i, "");
  return t.trim();
}

function ask(prompt, label) {
  const started = Date.now();
  const res = spawnSync("agy", ["--print", prompt, "--model", MODEL, "--print-timeout", TIMEOUT], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const ms = Date.now() - started;
  if (res.status !== 0) {
    log({ label, model: MODEL, ms, ok: false, stderr: (res.stderr || "").slice(0, 500) });
    throw new Error(`agy failed for ${label}: ${res.stderr || res.stdout}`);
  }
  const out = stripFences(res.stdout || "");
  log({ label, model: MODEL, ms, ok: true, promptChars: prompt.length, outChars: out.length });
  return out;
}

/* ---------------------------------------------------------------- placeholders */

function protect(text) {
  const map = [];
  let t = text.replace(/\]\((https?:\/\/[^)\s]+)\)/g, (_m, url) => {
    map.push(`](${url})`);
    return `⟦U${map.length}⟧`;
  });
  t = t.replace(/`[^`\n]+`/g, (m) => {
    map.push(m);
    return `⟦C${map.length}⟧`;
  });
  return { text: t, map };
}

function restore(text, map) {
  return text.replace(/⟦[UC](\d+)⟧/g, (m, i) => map[Number(i) - 1] ?? m);
}

/* ---------------------------------------------------------------- validation */

const MYANMAR = /[က-႟]/;

function counts(text) {
  const lines = text.split("\n");
  const c = { h1: 0, h2: 0, h3: 0, items: 0, rows: 0, bold: 0, placeholders: [] };
  for (const l of lines) {
    if (/^# /.test(l)) c.h1 += 1;
    else if (/^## /.test(l)) c.h2 += 1;
    else if (/^### /.test(l)) c.h3 += 1;
    if (/^\s*(?:-|\d+\.)\s+/.test(l)) c.items += 1;
    if (/^\|/.test(l)) c.rows += 1;
  }
  c.bold = (text.match(/\*\*/g) ?? []).length;
  c.placeholders = (text.match(/⟦[UC]\d+⟧/g) ?? []).sort();
  return c;
}

function validate(src, out) {
  const errors = [];
  const a = counts(src);
  const b = counts(out);
  for (const k of ["h1", "h2", "h3", "items", "rows"]) {
    if (a[k] !== b[k]) errors.push(`${k}: expected ${a[k]}, got ${b[k]}`);
  }
  if (a.bold !== b.bold) errors.push(`bold markers (**): expected ${a.bold}, got ${b.bold}`);
  const missing = a.placeholders.filter((p) => !b.placeholders.includes(p));
  const extra = b.placeholders.filter((p) => !a.placeholders.includes(p));
  const dupes = b.placeholders.filter((p, i) => b.placeholders.indexOf(p) !== i);
  if (missing.length) errors.push(`missing placeholders: ${missing.join(" ")}`);
  if (extra.length) errors.push(`unexpected placeholders: ${extra.join(" ")}`);
  if (dupes.length) errors.push(`duplicated placeholders: ${[...new Set(dupes)].join(" ")}`);
  if (/```/.test(out)) errors.push("contains a code fence");
  if (/[၀-၉]/.test(out)) errors.push("Burmese numerals used; keep all digits as ASCII 0-9");

  // Unicode vs Zawgyi: Unicode Burmese uses U+103A (asat) heavily and never the U+1060–U+109F medial forms.
  const asatUnicode = (out.match(/်/g) ?? []).length;
  const asatZawgyi = (out.match(/္/g) ?? []).length;
  const zawgyiForms = (out.match(/[ၠ-႗]/g) ?? []).length;
  if (asatZawgyi > asatUnicode) errors.push(`looks like Zawgyi (U+1039 ${asatZawgyi} > U+103A ${asatUnicode})`);
  if (zawgyiForms > 2) errors.push(`Zawgyi-only code points present (${zawgyiForms})`);

  // Coverage: every prose line that has Latin words should carry Myanmar script unless it is placeholder/link only.
  const untranslated = [];
  for (const l of out.split("\n")) {
    const t = l.trim();
    if (!t || /^\|?\s*-{2,}/.test(t) || /^#+\s*$/.test(t)) continue;
    const stripped = t.replace(/⟦[UC]\d+⟧/g, "").replace(/\[[^\]]*\]/g, "").replace(/[*_#|>\-\d.():,;“”"'’/ ]/g, "");
    if (stripped.length >= 40 && !MYANMAR.test(stripped)) untranslated.push(t.slice(0, 60));
  }
  if (untranslated.length > 3) errors.push(`untranslated lines (${untranslated.length}), e.g. "${untranslated[0]}"`);
  return errors;
}

/* ---------------------------------------------------------------- prompts */

const TERMS = [
  "agent", "coding agent", "agent loop", "tool", "tool call", "tool definition", "system prompt", "prompt",
  "prompt engineering", "context", "context window", "context engineering", "compaction", "token", "model",
  "inference", "harness", "workflow", "spec (specification)", "spec-driven development", "plan", "research",
  "implement", "test", "evaluation (eval)", "benchmark", "trace / tracing", "observability", "logging", "skill",
  "subagent", "hook", "guardrail", "repository", "codebase", "pull request", "code review", "reviewer", "merge",
  "commit", "branch", "worktree", "continuous integration (CI)", "lint", "test suite", "deterministic check",
  "agent-ready / readiness", "threat model", "prompt injection", "sandbox", "least privilege", "secret / credential",
  "permission", "allowlist", "audit log", "gateway", "portal", "routing", "rate limit", "budget", "cost", "latency",
  "retry", "checkpoint", "background agent", "orchestration", "issue (ticket)", "fleet", "software factory",
  "self-improving", "postmortem", "incident", "capstone", "done when (acceptance checklist)", "weekly build",
  "core material", "deeper material", "optional", "week", "deliverable", "acceptance criteria", "edge case",
  "regression", "human approval", "adoption", "productivity",
];

const KEEP_ENGLISH =
  "Claude Code, Codex, Cursor, Gemini CLI, opencode, Claude, GPT, Gemini, Anthropic, OpenAI, Google, GitHub, Vercel, Cloudflare, Semgrep, CodeQL, gitleaks, OSV-Scanner, Playwright, Temporal, LiteLLM, Langfuse, Phoenix, DSPy, Hugging Face, DeepLearning.AI, MCP, MCP server, AGENTS.md, CLAUDE.md, SKILL.md, RePPIT, SWE-bench, Terminal-Bench, OWASP, NIST, DORA, METR, SRE, Kiro, Spec Kit, Symphony, Devin, DeepWiki, Warp, Replit, Factory, Cognition, YouTube";

function rulesBlock(glossary) {
  return `You are a professional technical translator. Translate Markdown from English into Burmese (Myanmar language).

Hard rules:
1. Output Burmese in Unicode encoding only. Never Zawgyi.
2. Preserve the Markdown structure exactly: the same headings with the same levels, the same list markers and numbering, the same table rows and columns, the same bold (**) and italic markers, the same blank lines. Do not add or remove lines.
3. Placeholders such as ⟦U12⟧ or ⟦C3⟧ stand for URLs and code. Copy every placeholder exactly once, unchanged, in the same position. Never translate, drop, duplicate, or invent placeholders.
4. Keep in English, untranslated and untransliterated: product, tool, company, protocol, model, and file names; acronyms (LLM, API, CLI, PR, CI, SAST, SCA, RSC, PDF, JSON); commands; people's names. Examples: ${KEEP_ENGLISH}.
5. Translate concepts with the glossary below. The first time a glossary term appears in a section, write the Burmese followed by the English in parentheses, e.g. ကိရိယာခေါ်ဆိုမှု (tool call). After that, use the Burmese alone.
6. Keep numbers, durations such as (59 min) or (1 h 33 min), dates, version numbers, and week numbers exactly as written, using ASCII digits 0-9 only (never Burmese numerals ၀-၉). You may translate the words "min" and "h" but keep the digits.
7. Link text in square brackets: keep it in English when it is the title of a video, article, talk, book, course, paper, or repository; translate it when it is an ordinary descriptive phrase.
8. Tone: clear, direct, natural modern written Burmese for software engineers. Prefer short sentences. Do not add explanations or notes of your own.
9. Output only the translated Markdown. No preamble, no closing remarks, no code fences.

Glossary (English → Burmese):
${glossary}
`;
}

/* ---------------------------------------------------------------- steps */

function stepGlossary() {
  if (existsSync(GLOSSARY) && !FORCE) {
    console.log(`glossary: using existing ${GLOSSARY}`);
    return readFileSync(GLOSSARY, "utf8");
  }
  const prompt = `You are a Burmese (Myanmar) technical translator preparing a glossary for a software engineering study guide about coding agents.

For each English term below, give the best modern Burmese rendering in Unicode, as used by Burmese software engineers. Translate the concept; do not transliterate unless Burmese engineers really say the English word (then give the transliteration and mark it). Product and company names are not in this list and stay English.

Return ONLY a Markdown table with exactly three columns: | English | Burmese | Note |. One row per term, in the given order, no extra rows, no text before or after the table. The Note column is a short English hint on usage or an alternative (may be empty).

Terms:
${TERMS.map((t) => `- ${t}`).join("\n")}`;
  const out = ask(prompt, "glossary");
  const rows = out.split("\n").filter((l) => /^\|/.test(l));
  if (rows.length < TERMS.length) throw new Error(`glossary: expected ≥${TERMS.length} rows, got ${rows.length}`);
  writeFileSync(GLOSSARY, out + "\n");
  console.log(`glossary: wrote ${rows.length - 2} terms → ${GLOSSARY}`);
  return out;
}

function stepUi(glossary) {
  if (existsSync(UI_MY) && !FORCE) {
    console.log(`ui: using existing ${UI_MY}`);
    return;
  }
  const en = JSON.parse(readFileSync(UI_EN, "utf8"));
  const prompt = `${rulesBlock(glossary)}
Task: translate the VALUES of this JSON object from English into Burmese. Keep every KEY exactly as is. Keep placeholders in curly braces such as {date}, {count}, {n}, {total} unchanged. Keep the values of "lang.switchToBurmese" and "lang.switchToEnglish" exactly as given. "site.name", "site.short" and "hero.title" / "hero.subtitle" may stay English or be rendered as a Burmese subtitle; keep them short. Return ONLY valid JSON with the same keys, no code fences.

${JSON.stringify(en, null, 2)}`;
  const out = ask(prompt, "ui");
  let my;
  try {
    my = JSON.parse(out);
  } catch (e) {
    throw new Error(`ui: model returned invalid JSON: ${out.slice(0, 200)}`);
  }
  const missing = Object.keys(en).filter((k) => !(k in my));
  const extra = Object.keys(my).filter((k) => !(k in en));
  if (missing.length || extra.length) throw new Error(`ui: key mismatch. missing=${missing} extra=${extra}`);
  for (const k of Object.keys(en)) {
    const ph = en[k].match(/\{[a-zA-Z]+\}/g) ?? [];
    for (const p of ph) if (!String(my[k]).includes(p)) throw new Error(`ui: placeholder ${p} missing in ${k}`);
  }
  mkdirSync(dirname(UI_MY), { recursive: true });
  writeFileSync(UI_MY, JSON.stringify(my, null, 2) + "\n");
  console.log(`ui: wrote ${Object.keys(my).length} strings → ${UI_MY}`);
}

function loadChunks() {
  const source = readFileSync(SRC, "utf8");
  const { text, map } = protect(source);
  writeFileSync(PLACEHOLDERS, JSON.stringify(map, null, 0));
  const lines = text.split("\n");
  const chunks = [];
  let current = [];
  for (const line of lines) {
    if (line.startsWith("## ") && current.length) {
      chunks.push(current.join("\n"));
      current = [];
    }
    current.push(line);
  }
  if (current.length) chunks.push(current.join("\n"));
  return { chunks, map };
}

function chunkPath(i) {
  return resolve(CHUNKS, `${String(i).padStart(2, "0")}.my.md`);
}

function stepTranslate(glossary) {
  const { chunks } = loadChunks();
  const rules = rulesBlock(glossary);
  let done = 0;
  for (let i = 0; i < chunks.length; i += 1) {
    if (ONLY.length && !ONLY.includes(i)) continue;
    const path = chunkPath(i);
    const src = chunks[i];
    const title = (src.split("\n")[0] || "").slice(0, 60);
    if (existsSync(path) && !FORCE) {
      const cached = readFileSync(path, "utf8");
      const errs = validate(src, cached);
      if (!errs.length) {
        console.log(`chunk ${i} (${title}): cached ✓`);
        done += 1;
        continue;
      }
      console.log(`chunk ${i} (${title}): cached copy fails validation, retranslating: ${errs[0]}`);
    }
    let feedback = "";
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt += 1) {
      const prompt = `${rules}
${feedback}
Translate the following Markdown section. Output only the translated Markdown.

<<<SECTION>>>
${src}
<<<END>>>`;
      let out = ask(prompt, `chunk-${i}-attempt-${attempt}`);
      out = out.replace(/^<<<SECTION>>>\s*/, "").replace(/\s*<<<END>>>$/, "").trim();
      const errs = validate(src, out);
      if (!errs.length) {
        writeFileSync(path, out + "\n");
        console.log(`chunk ${i} (${title}): ✓ attempt ${attempt}, ${out.length} chars`);
        ok = true;
        done += 1;
      } else {
        console.log(`chunk ${i} (${title}): ✗ attempt ${attempt}: ${errs.join("; ")}`);
        writeFileSync(resolve(CHUNKS, `${String(i).padStart(2, "0")}.attempt${attempt}.rejected.md`), out + "\n");
        feedback = `Your previous attempt failed these structural checks: ${errs.join("; ")}. Translate the whole section again and fix every one of them.\n`;
      }
    }
    if (!ok) console.log(`chunk ${i}: FAILED after 3 attempts (see rejected files)`);
  }
  console.log(`translate: ${done}/${ONLY.length || chunks.length} chunks ready`);
}

function stepAssemble() {
  const { chunks, map } = loadChunks();
  const parts = [];
  const missing = [];
  for (let i = 0; i < chunks.length; i += 1) {
    const path = chunkPath(i);
    if (!existsSync(path)) {
      missing.push(i);
      continue;
    }
    parts.push(readFileSync(path, "utf8").trim());
  }
  if (missing.length) throw new Error(`assemble: missing chunks ${missing.join(", ")}`);
  const joined = parts.join("\n\n") + "\n";
  const restored = restore(joined, map);
  const left = restored.match(/⟦[UC]\d+⟧/g);
  if (left) throw new Error(`assemble: unrestored placeholders ${left.slice(0, 5).join(" ")}`);
  writeFileSync(OUT, restored);
  console.log(`assemble: wrote ${OUT} (${restored.length} chars)`);
}

function stepValidate() {
  const src = readFileSync(SRC, "utf8");
  const out = readFileSync(OUT, "utf8");
  const a = protect(src);
  const b = protect(out);
  const errs = validate(a.text, b.text);
  const urlsA = new Set(src.match(/\]\((https?:\/\/[^)\s]+)\)/g));
  const urlsB = new Set(out.match(/\]\((https?:\/\/[^)\s]+)\)/g));
  if (urlsA.size !== urlsB.size || [...urlsA].some((u) => !urlsB.has(u))) errs.push("URL sets differ");
  if (errs.length) {
    console.log("validate: ✗\n  " + errs.join("\n  "));
    process.exitCode = 1;
  } else {
    console.log(`validate: ✓ structure matches (${urlsA.size} links, ${counts(a.text).items} list items, ${counts(a.text).h2} sections)`);
  }
}

/* ---------------------------------------------------------------- main */

const glossary = ["glossary", "ui", "translate", "all"].includes(STEP) ? stepGlossary() : existsSync(GLOSSARY) ? readFileSync(GLOSSARY, "utf8") : "";
if (STEP === "ui" || STEP === "all") stepUi(glossary);
if (STEP === "translate" || STEP === "all") stepTranslate(glossary);
if (STEP === "assemble" || STEP === "all") stepAssemble();
if (STEP === "validate" || STEP === "all") stepValidate();
