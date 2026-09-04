#!/usr/bin/env node
// Diagnostic: node scripts/agy-probe.mjs <variant> [model] [seconds]
// Variants: full | noglossary | rawlinks | firsthalf | secondhalf | tiny
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const [variant = "noglossary", model = "Gemini 3.1 Pro (Low)", secs = "240"] = process.argv.slice(2);
const root = resolve(import.meta.dirname, "..", "..");
const src = readFileSync(resolve(root, "outputs", "agentic-engineer-study-guide-2026.md"), "utf8");
const sections = src.split(/\n(?=## )/);
let section = sections[1]; // "## How to use this guide"

function protect(t) {
  let n = 0;
  t = t.replace(/\]\((https?:\/\/[^)\s]+)\)/g, () => `⟦U${++n}⟧`);
  t = t.replace(/`[^`\n]+`/g, () => `⟦C${++n}⟧`);
  return t;
}

const rules = `Do not use any tools. Answer directly. Translate the Markdown below from English into Burmese (Unicode). Keep Markdown structure, keep placeholders like ⟦U1⟧ unchanged, keep product names in English, keep digits ASCII. Output only the translation.\n\n`;
const glossary = readFileSync(resolve(root, ".scratch", "burmese-translation", "glossary.md"), "utf8");

let body;
switch (variant) {
  case "full":
    body = rules + "Glossary:\n" + glossary + "\n\n" + protect(section);
    break;
  case "noglossary":
    body = rules + protect(section);
    break;
  case "rawlinks":
    body = rules + section;
    break;
  case "firsthalf":
    body = rules + protect(section.split("### Tooling and budget")[0]);
    break;
  case "secondhalf":
    body = rules + protect("### Tooling and budget" + section.split("### Tooling and budget")[1]);
    break;
  case "tiny":
    body = rules + "Plan on **10–12 hours per week**. Split it like this:\n\n- 3–4 hours: the **Core material** for the week.";
    break;
  default:
    throw new Error("unknown variant");
}

const started = Date.now();
const res = spawnSync("agy", ["--print", body, "--model", model, "--print-timeout", `${secs}s`, "--dangerously-skip-permissions"], {
  encoding: "utf8",
  timeout: Number(secs) * 1000 + 15000,
  killSignal: "SIGKILL",
  maxBuffer: 32 * 1024 * 1024,
});
const ms = Date.now() - started;
console.log(`variant=${variant} model=${model} promptChars=${body.length} elapsed=${(ms / 1000).toFixed(0)}s status=${res.status} err=${res.error?.code ?? ""}`);
console.log((res.stdout || "").slice(0, 500));
if (res.stderr) console.log("stderr:", res.stderr.slice(0, 300));
