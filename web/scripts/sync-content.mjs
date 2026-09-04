// Copies the canonical markdown (and the PDF) from ../outputs into this app.
// Safe to run where ../outputs does not exist (e.g. on Vercel): it just skips.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outputs = resolve(root, "..", "outputs");

const pairs = [
  [resolve(outputs, "agent-engineer-study-guide-2026.md"), resolve(root, "content", "guide.md")],
  [resolve(outputs, "agent-engineer-study-guide-2026.pdf"), resolve(root, "public", "agent-engineer-study-guide-2026.pdf")],
];

let copied = 0;
for (const [src, dst] of pairs) {
  if (!existsSync(src)) continue;
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(src, dst);
  copied += 1;
  console.log(`synced ${src} -> ${dst}`);
}
if (copied === 0) console.log("sync-content: no source files found, keeping committed copies");
