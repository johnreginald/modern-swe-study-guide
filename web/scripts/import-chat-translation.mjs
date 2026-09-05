#!/usr/bin/env node
/**
 * Import the hand-approved Burmese Markdown (from Gemini chat) as the Burmese edition.
 *
 *   node scripts/import-chat-translation.mjs [--in .scratch/burmese-translation/chat-version.md]
 *
 * Keeps the wording verbatim. Restores the English guide's links by matching link titles,
 * normalises structure for the site parser (weeks as `## Week N — Title`, `- ` bullets,
 * checkbox items → Done-when bullets, LaTeX arrow line → pipeline code line, UI-only lines
 * dropped), appends the two sections the chat version does not cover (bookshelf, half-time)
 * from a separate file if present, and reports every English link it could not place.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.indexOf(`--${n}`) === -1 ? d : argv[argv.indexOf(`--${n}`) + 1]);
const IN = resolve(root, opt("in", ".scratch/burmese-translation/chat-version.md"));
const EXTRA = resolve(root, ".scratch/burmese-translation/chat-extra-sections.md");
const EN = resolve(root, "outputs", "agentic-engineer-study-guide-2026.md");
const OUT = resolve(root, "outputs", "agentic-engineer-study-guide-2026.my.md");
const REPORT = resolve(root, ".scratch/burmese-translation/import-report.md");

// Safety: outputs/…my.md is edited directly now. Refuse to clobber it with an older chat export.
import { statSync } from "node:fs";
if (existsSync(OUT) && !argv.includes("--force")) {
  const outTime = statSync(OUT).mtimeMs;
  const inTime = statSync(IN).mtimeMs;
  if (outTime > inTime) {
    console.error(`refusing to overwrite ${OUT}: it is newer than ${IN}. Pass --force to re-import anyway.`);
    process.exit(2);
  }
}

const en = readFileSync(EN, "utf8");
let src = readFileSync(IN, "utf8").replace(/\r\n/g, "\n");

/* ---------- 1. English link inventory: title → url, plus per-section membership ---------- */
const enSections = en.split(/\n(?=## )/);
const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
const titleToUrl = new Map(); // lowercased title → url (first wins)
const allUrls = new Set();
const urlTitles = new Map(); // url → Set(titles)
for (const m of en.matchAll(linkRe)) {
  const title = m[1].replace(/[*_`]/g, "").trim();
  const url = m[2];
  allUrls.add(url);
  if (!titleToUrl.has(title.toLowerCase())) titleToUrl.set(title.toLowerCase(), url);
  (urlTitles.get(url) ?? urlTitles.set(url, new Set()).get(url)).add(title);
}
// Extra aliases the chat version uses for some links.
const ALIASES = {
  "model context protocol (mcp) specification": "https://modelcontextprotocol.io/specification/latest",
  "mcp course (hugging face)": "https://huggingface.co/learn/mcp-course/en/unit0/introduction",
  "mcp course": "https://huggingface.co/learn/mcp-course/en/unit0/introduction",
  "phoenix": "https://arize.com/docs/phoenix/tracing/tutorial/your-first-traces",
  "context engineering for ai agents: lessons from building manus": "https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus",
  "how long contexts fail (drew breunig)": "https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html",
  "how long contexts fail": "https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html",
  "context rot (chroma)": "https://research.trychroma.com/context-rot",
  "context rot": "https://research.trychroma.com/context-rot",
  "advanced context engineering (humanlayer)": "https://www.hlyr.dev/blog/advanced-context-engineering",
  "specs are the new source code (ravi mehta)": "https://blog.ravi-mehta.com/p/specs-are-the-new-source-code",
  "engineering practices: code review": "https://google.github.io/eng-practices/review/",
  "reviewer guide": "https://google.github.io/eng-practices/review/reviewer/",
  "software engineering at google (chapter 9: code review)": "https://abseil.io/resources/swe-book/html/ch09.html",
  "github copilot code review": "https://docs.github.com/en/copilot/concepts/agents/code-review",
  "claude code github actions": "https://code.claude.com/docs/en/github-actions",
  "don't build multi-agents (cognition)": "https://cognition.ai/blog/dont-build-multi-agents",
  "don't build multi-agents": "https://cognition.ai/blog/dont-build-multi-agents",
  "swe-bench technical report": "https://cognition.ai/blog/swe-bench-technical-report",
  "devin: coding agents 101": "https://devin.ai/agents101",
  "google research: resolving code review comments with ml": "https://research.google/blog/resolving-code-review-comments-with-ml/",
  "resolving code review comments with ml": "https://research.google/blog/resolving-code-review-comments-with-ml/",
  "owasp mcp top 10": "https://owasp.org/www-project-mcp-top-10/",
  "owasp top 10 for llm applications": "https://genai.owasp.org/llm-top-10/",
  "the lethal trifecta for ai agents": "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/",
  "prompt injection explained": "https://simonwillison.net/2023/May/2/prompt-injection-explained/",
  "web llm attacks labs": "https://portswigger.net/web-security",
  "semgrep": "https://semgrep.dev/docs/",
  "codeql": "https://codeql.github.com/",
  "gitleaks": "https://github.com/gitleaks/gitleaks",
  "osv-scanner": "https://google.github.io/osv-scanner/",
  "claude-code-security-review": "https://github.com/anthropics/claude-code-security-review",
  "mcp tool poisoning": "https://owasp.org/www-community/attacks/MCP_Tool_Poisoning",
  "agentic ai threats and mitigations": "https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/",
  "owasp genai security project": "https://genai.owasp.org/",
  "design patterns for securing llm agents against prompt injections": "https://arxiv.org/abs/2506.08837",
  "strengthening ai agent hijacking evaluations": "https://www.nist.gov/news-events/news/2025/01/technical-blog-strengthening-ai-agent-hijacking-evaluations",
  "threat modeling: designing for security": "https://shostack.org/archive/2014/02/threat-modeling-designing-for-security/",
  "codex cloud": "https://developers.openai.com/codex/cloud",
  "claude code on the web": "https://code.claude.com/docs/en/claude-code-on-the-web",
  "cursor cloud agents": "https://cursor.com/docs/cloud-agent",
  "github copilot coding agent": "https://docs.github.com/en/copilot/how-tos/github-copilot-app/managing-issues-and-pull-requests",
  "open-sourcing symphony": "https://openai.com/index/open-source-codex-orchestration-symphony/",
  "symphony specification": "https://github.com/openai/symphony/blob/main/SPEC.md",
  "cloudflare agents sdk": "https://developers.cloudflare.com/agents/",
  "sandbox sdk": "https://developers.cloudflare.com/sandbox/",
  "temporal durable ai agent tutorial": "https://github.com/temporal-community/tutorial-temporal-ai-agent",
  "code mode (cloudflare)": "https://blog.cloudflare.com/code-mode-mcp/",
  "code mode": "https://blog.cloudflare.com/code-mode-mcp/",
  "jules (google)": "https://jules.google/",
  "gateways are all you need": "https://ai.engineer/talks/CD6R4Wf3jnY-gateways-are-all-you-need",
  "enterprise-ready mcp": "https://ai.engineer/talks/what-does-enterprise-ready-mcp-mean",
  "scaling mcp adoption: reference architecture for enterprise deployments": "https://blog.cloudflare.com/enterprise-mcp/",
  "enterprise-managed authorization": "https://blog.modelcontextprotocol.io/posts/enterprise-managed-auth/",
  "2025 state of ai-assisted software development": "https://dora.dev/research/2025/dora-report/",
  "measuring the impact of early-2025 ai on experienced developer productivity": "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/",
  "litellm ai gateway": "https://docs.litellm.ai/docs/simple_proxy",
  "cloudflare ai gateway": "https://developers.cloudflare.com/ai-gateway/",
  "six llm routing strategies": "https://vercel.com/i/llm-routing-strategies",
  "mcp registry": "https://github.com/modelcontextprotocol/registry",
  "dora ai capabilities model": "https://dora.dev/ai/capabilities-model/report/",
  "stack overflow 2025 survey": "https://survey.stackoverflow.co/2025/ai",
  "openai codex pdf": "https://cdn.openai.com/pdf/6a2631dc-783e-479b-b1a4-af0cfbd38630/how-openai-uses-codex.pdf",
  "anthropic team cases": "https://www.anthropic.com/news/how-anthropic-teams-use-claude-code",
  "accelerate (စာအုပ်)": "https://www.simonandschuster.com/books/Accelerate/Nicole-Forsgren-PhD/9781942788331",
  "google sre: postmortem culture": "https://sre.google/sre-book/postmortem-culture/",
  "how to debug ai agents: tracing, observability & evals": "https://www.youtube.com/watch?v=nWNWrtCDqaY",
  "langfuse": "https://langfuse.com/docs",
  "opentelemetry genai conventions": "https://github.com/open-telemetry/semantic-conventions-genai",
  "dspy": "https://dspy.ai/",
  "swe-bench": "https://www.swebench.com/",
  "terminal-bench": "https://www.tbench.ai/",
  "the software factory": "https://ai-in-the-am.com/episodes/ai-am-2026-06-18/",
  "future of programming (dhh)": "https://www.youtube.com/watch?v=NYFGCESmikA",
  "future of programming, ai, agentic engineering, vibe coding and linux": "https://www.youtube.com/watch?v=NYFGCESmikA",
  "hooks reference": "https://code.claude.com/docs/en/hooks",
  "create custom subagents": "https://code.claude.com/docs/en/sub-agents",
  "how to write a great agents.md: lessons from over 2,500 repositories": "https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/",
  "how to write an agents.md file": "https://realpython.com/agents-md/",
  "writing an effective agents.md": "https://aaif.io/blog/writing-an-effective-agents-md",
  "how we built our multi-agent research system": "https://www.anthropic.com/engineering/multi-agent-research-system",
  "claude code in action": "https://anthropic.skilljar.com/claude-code-in-action",
  "claude code advanced patterns: subagents, mcp, and scaling to real codebases": "https://www.anthropic.com/webinars/claude-code-advanced-patterns",
  "the secrets of claude code from the engineers who built it": "https://www.youtube.com/watch?v=IDSAMqip6ms",
  "unlocking the codex harness (openai)": "https://openai.com/index/unlocking-the-codex-harness/",
  "unlocking the codex harness": "https://openai.com/index/unlocking-the-codex-harness/",
  "context engineering (dex horthy)": "https://youtu.be/Usufn8IQJgw",
  "diátaxis framework": "https://diataxis.fr/",
  "making codebases agent-ready": "https://ai.engineer/talks/making-codebases-agent-ready",
  "building reliable agentic systems": "https://ai.engineer/talks/building-reliable-agentic-systems",
  "the missing semester 2026: shell overview & intro": "https://missing.csail.mit.edu/2026/course-shell/",
  "agents.md standard": "https://agents.md/",
  "command line interface guidelines": "https://clig.dev/",
  "playwright mcp": "https://github.com/microsoft/playwright-mcp",
  "chrome devtools mcp": "https://github.com/ChromeDevTools/chrome-devtools-mcp",
  "browser-use": "https://github.com/browser-use/browser-use",
  "common workflows (claude code)": "https://code.claude.com/docs/en/common-workflows",
  "spec kit": "https://github.github.com/spec-kit/",
  "agentic sdd workflow": "https://github.github.com/spec-kit/reference/agentic-sdd.html",
  "mcp inspector": "https://github.com/modelcontextprotocol/inspector",
  "12-factor agents": "https://github.com/humanlayer/12-factor-agents",
  "agent skills": "https://huggingface.co/learn/context-course/en/unit1/introduction",
  "sub-agents & hooks": "https://huggingface.co/learn/context-course/en/unit4/introduction",
  "anthropic's sandboxing": "https://www.anthropic.com/engineering/claude-code-sandboxing",
  "anthropic ရဲ့ sandboxing": "https://www.anthropic.com/engineering/claude-code-sandboxing",
  "claude code in action (anthropic academy & deeplearning.ai)": "https://anthropic.skilljar.com/claude-code-in-action",
  "open-sourcing symphony & specification": "https://openai.com/index/open-source-codex-orchestration-symphony/",
  "enterprise-managed authorization": "https://blog.modelcontextprotocol.io/posts/enterprise-managed-auth/",
  "context course": "https://huggingface.co/learn/context-course/en/unit0/introduction",
  "prompt caching": "https://platform.claude.com/docs/en/build-with-claude/prompt-caching",
  "claude code": "https://code.claude.com/docs/en/common-workflows",
  "openai codex cli": "https://github.com/openai/codex",
  "cursor": "https://cursor.com/docs/cloud-agent",
  "gemini cli": "https://github.com/google-gemini/gemini-cli",
  "opencode": "https://github.com/sst/opencode",
  "codex-rs/core": "https://github.com/openai/codex/tree/main/codex-rs/core",
  "ai engineering (chip huyen)": "https://huyenchip.com/",
  "how to build a coding agent: free workshop": "https://ghuntley.com/agent/",
  "mini-swe-agent": "https://github.com/SWE-agent/mini-swe-agent",
  "a practical guide to building agents": "https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf",
  "deep dive into llms like chatgpt": "https://www.youtube.com/watch?v=7xTGNNLPyMI",
  "always-on agents run production without the on-call tax": "https://ai.engineer/talks/always-on-agents-run-production-without-the-on-call-tax",
  "themodernsoftware.dev": "https://themodernsoftware.dev/",
  "public skills repository": "https://github.com/anthropics/skills",
  "openai agents integration": "https://github.com/temporalio/sdk-python/blob/main/temporalio/contrib/openai_agents/README.md",
  "google sre: introduction": "https://sre.google/sre-book/introduction/",
  "claude code: a highly agentic coding assistant": "https://www.deeplearning.ai/courses/claude-code-a-highly-agentic-coding-assistant",
  "prompting 101": "https://www.youtube.com/watch?v=ysPbXH0LpIE",
  "ai-powered entomology: lessons from millions of ai code reviews": "https://ai.engineer/talks/TswQeKftnaw-ai-powered-entomology-lessons-from-millions-ai",
  "evaluating ai agents": "https://www.deeplearning.ai/courses/evaluating-ai-agents",
};
for (const [k, v] of Object.entries(ALIASES)) if (!titleToUrl.has(k)) titleToUrl.set(k, v);

/* ---------- 2. structural normalisation ---------- */
const lines = src.split("\n");
const out = [];
let section = "preamble";
let skipUntilHeading = false;
for (let i = 0; i < lines.length; i += 1) {
  let l = lines[i];
  const t = l.trim();

  // Home page scaffolding (hero, buttons, progress) is UI: drop it.
  if (/^# Home/.test(t)) {
    skipUntilHeading = true;
    continue;
  }
  if (skipUntilHeading) {
    if (t.startsWith("Coding agents")) skipUntilHeading = false;
    else continue;
  }
  if (/^# More \(/.test(t)) {
    section = "more";
  }
  if (section === "more") continue; // More page is UI strings, handled separately

  // Week headings: "# Week 1: Title" → "## Week 1 — Title"
  const week = /^# Week (\d+): (.+)$/.exec(t);
  if (week) {
    out.push(`## Week ${week[1]} — ${week[2].trim()}`);
    section = "week";
    continue;
  }
  if (/^# Capstone Project/.test(t)) {
    out.push("## Capstone Project");
    section = "capstone";
    continue;
  }
  // Drop the per-week italic ordinal line and the bold meta line (site renders those itself).
  if (/^\*\(ရက်သတ္တပတ်.*\)\*$/.test(t) || /^\*\(၁၀ ပတ် သင်ရိုးအပြီး.*\)\*$/.test(t)) continue;
  if (/^\*\*အဓိက လေ့လာစရာများ \(Core\) ≈ .*· စံသတ်မှတ်ချက်/.test(t)) continue;
  // "[0/4 …]" pill line.
  if (/^`\[0\/\d+ .*\]`$/.test(t)) continue;
  // Horizontal rules are noise for the site parser.
  if (t === "---") continue;
  // LaTeX pipeline → code line.
  if (t.startsWith("$$")) {
    out.push("`issue → aligned spec → isolated agent run → tests/checks → independent review → human merge`");
    continue;
  }
  // Bullets: "* " → "- ", "* [ ] " → "- ".
  l = l.replace(/^(\s*)\*\s+\[ \]\s+/, "$1- ").replace(/^(\s*)\*\s+/, "$1- ");
  out.push(l);
}

// Join lazy continuation lines onto their list item ("- **Title** *(meta):*\ndescription").
const joined = [];
for (const l of out) {
  const prev = joined[joined.length - 1];
  if (
    prev !== undefined &&
    /^\s*(-|\d+\.)\s+/.test(prev) &&
    l.trim() &&
    !/^\s*(-|\d+\.)\s+/.test(l) &&
    !l.startsWith("#") &&
    !l.startsWith("`")
  ) {
    joined[joined.length - 1] = `${prev} ${l.trim()}`;
  } else joined.push(l);
}

/* ---------- 3. restore links ---------- */
const MY = /[က-႟]/;
const titles = [...titleToUrl.keys()].filter((k) => k.length >= 4).sort((a, b) => b.length - a.length);
const usedInSection = new Map(); // section index → Set(url)
const placed = new Set();
let sectionIdx = 0;
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const CODE_LINK = ["browser-use", "claude-code-security-review", "gitleaks", "OSV-Scanner"];
const preLinked = joined.map((line) => {
  let r = line;
  for (const t of CODE_LINK) {
    const url = titleToUrl.get(t.toLowerCase());
    if (url && r.includes(`\`${t}\``) && !r.includes(`](${url})`)) r = r.replace(`\`${t}\``, `[\`${t}\`](${url})`);
  }
  return r;
});
// Names that may be linked in plain prose, but only inside these sections (matched on the section heading).
const PLAIN_OK = {
  "claude code": ["ဒီလမ်းညွှန်ကို ဘယ်လို"],
  "cursor": ["ဒီလမ်းညွှန်ကို ဘယ်လို"],
  "opencode": ["ဒီလမ်းညွှန်ကို ဘယ်လို", "Week 1"],
  "gemini cli": ["ဒီလမ်းညွှန်ကို ဘယ်လို", "Week 1"],
  "openai codex cli": ["ဒီလမ်းညွှန်ကို ဘယ်လို"],
  "context course": ["ဒီလမ်းညွှန်ကို ဘယ်လို"],
  "prompt caching": ["ဒီလမ်းညွှန်ကို ဘယ်လို"],
  "context engineering": ["Week 2", "Week 5"],
  "specification": ["Week 2"],
  "semgrep": ["Week 7"],
  "codeql": ["Week 7"],
  "playwright mcp": ["Week 3"],
  "chrome devtools mcp": ["Week 3"],
  "mcp inspector": ["Week 2"],
  "mcp course": ["Week 2"],
  "swe-bench": ["Week 10"],
  "terminal-bench": ["Week 10"],
  "langfuse": ["Week 10"],
  "dspy": ["Week 10"],
  "agent skills": ["Week 3"],
  "code mode": ["Week 8"],
  "sandbox sdk": ["Week 8"],
  "cloudflare agents sdk": ["Week 8"],
  "codex cloud": ["Week 8"],
  "claude code on the web": ["Week 8"],
  "cursor cloud agents": ["Week 8"],
  "github copilot coding agent": ["Week 8"],
  "litellm ai gateway": ["Week 9"],
  "cloudflare ai gateway": ["Week 9"],
  "reviewer guide": ["Week 6"],
  "gitleaks": ["Week 7"],
  "osv-scanner": ["Week 7"],
  "themodernsoftware.dev": ["preamble"],
  "mcp tool poisoning": ["Week 7"],
  "kiro specs docs": ["Week 2"],
  "how openai uses codex": ["Week 9"],
  "openai agents integration": ["Week 8"],
  "second edition": ["Week 7"],
  "mcp registry": ["Week 2", "Week 9"],
  "12-factor agents": ["Week 2"],
  "openai codex pdf": ["Week 9"],
  "anthropic team cases": ["Week 9"],
  "phoenix": ["Week 10"],
  "temporal durable ai agent tutorial": ["Week 8"],
};
const SHORT = 22; // titles shorter than this must sit in a title position (bold / italic / code) unless PLAIN_OK allows prose
let sectionHeading = "preamble";
const linked = preLinked.map((line) => {
  if (line.startsWith("## ")) {
    sectionIdx += 1;
    sectionHeading = line.slice(3);
  }
  if (!line.trim() || line.startsWith("#") || line.startsWith("`")) return line;
  let result = line;
  const used = usedInSection.get(sectionIdx) ?? usedInSection.set(sectionIdx, new Set()).get(sectionIdx);
  for (const title of titles) {
    const url = titleToUrl.get(title);
    if (used.has(url)) continue;
    const short = title.length < SHORT;
    const plainAllowed = (PLAIN_OK[title] ?? []).some((h) => sectionHeading.includes(h));
    const re = new RegExp(`(?<![\\w\\[\\]/])(${escapeRe(title)})(?![\\w\\]])(?![^\\[]*\\]\\()`, "i");
    const m = re.exec(result);
    if (!m) continue;
    const before = result.slice(0, m.index);
    const after = result.slice(m.index + m[0].length);
    if (/\[[^\]]*$/.test(before) && !/\]\([^)]*$/.test(before)) continue; // inside a link text
    const inCode = (before.match(/`/g) ?? []).length % 2 === 1;
    const inBold = (before.match(/\*\*/g) ?? []).length % 2 === 1;
    const inItalic = !inBold && ((before.replace(/\*\*/g, "").match(/\*/g) ?? []).length % 2 === 1);
    const titlePosition = inBold || inItalic || inCode;
    if (short && !titlePosition && !plainAllowed) continue;
    if (inCode) continue; // handled by the code-span pass
    result = `${before}[${m[1]}](${url})${after}`;
    used.add(url);
    placed.add(url);
  }
  return result;
});

/* ---------- 4. preamble + extra sections ---------- */
let body = linked.join("\n").replace(/\n{3,}/g, "\n\n").trim();
const head = `# Agentic Engineer Study Guide 2026\n\nစက်တင်ဘာ ၄၊ ၂၀၂၆\n\n`;
let extra = "";
if (existsSync(EXTRA)) extra = "\n\n" + readFileSync(EXTRA, "utf8").trim() + "\n";
const final = head + body + extra + "\n";
writeFileSync(OUT, final);

/* ---------- 5. report ---------- */
const missing = [...allUrls].filter((u) => !placed.has(u) && !final.includes(u));
const report = [
  `# Import report (${new Date().toISOString()})`,
  ``,
  `- English links: ${allUrls.size}`,
  `- placed in Burmese: ${[...allUrls].filter((u) => final.includes(u)).length}`,
  `- missing: ${missing.length}`,
  ``,
  ...missing.map((u) => `- ${[...(urlTitles.get(u) ?? [])].join(" / ")} → ${u}`),
].join("\n");
writeFileSync(REPORT, report + "\n");
console.log(report);
console.log(`\nwrote ${OUT} (${final.length} chars)`);
