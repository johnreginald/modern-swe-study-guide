// Generates public/sw.js from scripts/sw.template.js with a fresh cache version.
// Runs as the npm `prebuild` hook, so every deploy gets a new cache name.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const template = readFileSync(resolve(here, "sw.template.js"), "utf8");
const version =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
writeFileSync(resolve(here, "..", "public", "sw.js"), template.replace("__VERSION__", version));
console.log(`sw.js written with version ${version}`);
