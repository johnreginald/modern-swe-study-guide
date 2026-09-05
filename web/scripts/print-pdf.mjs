#!/usr/bin/env node
// Prints /print (English) and /my/print (Burmese) to PDF with headless Chrome.
// Usage: node scripts/print-pdf.mjs [--lang en|my|both] [--port 3210]
// Starts `next start` on the port if nothing answers there, then stops it again.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, "..");
const outputs = resolve(web, "..", "outputs");
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.indexOf(`--${n}`) === -1 ? d : argv[argv.indexOf(`--${n}`) + 1]);
const port = Number(opt("port", "3210"));
const langs = opt("lang", "both") === "both" ? ["en", "my"] : [opt("lang", "both")];
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}; set CHROME=/path/to/chrome`);

async function up() {
  try {
    const r = await fetch(`http://localhost:${port}/`);
    return r.ok;
  } catch {
    return false;
  }
}

let server = null;
if (!(await up())) {
  server = spawn("npx", ["-y", "serve@14", "out", "-l", String(port)], { cwd: web, stdio: "ignore", detached: true });
  for (let i = 0; i < 60 && !(await up()); i += 1) await new Promise((r) => setTimeout(r, 500));
  if (!(await up())) throw new Error("server did not start");
}

mkdirSync(outputs, { recursive: true });
for (const lang of langs) {
  const url = `http://localhost:${port}${lang === "my" ? "/my" : ""}/print`;
  const out = resolve(outputs, `modern-swe-study-guide-2026${lang === "my" ? ".my" : ".web"}.pdf`);
  const res = spawnSync(
    CHROME,
    ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=8000", `--print-to-pdf=${out}`, url],
    { encoding: "utf8", timeout: 120000 },
  );
  if (res.status !== 0 || !existsSync(out)) throw new Error(`print failed for ${lang}: ${res.stderr}`);
  console.log(`wrote ${out}`);
}
if (server) {
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    // ignore
  }
}
