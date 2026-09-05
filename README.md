# Modern Software Engineer Study Guide 2026

A ten-week, project-based guide to building software with coding agents: how agents work inside, context engineering and MCP, reusable skills, repository readiness, AI code review, security, background agents, team adoption, and the software factory. Every week pairs a capped set of core material (about 3.5 hours) with a build and a checkable "done when" list.

- **Read it:** https://modern-swe.burmese.dev (English) · https://modern-swe.burmese.dev/my (မြန်မာ)
- **Install it:** the site is a PWA; add it to your home screen and it works offline, with progress ticks saved on your device.
- **PDFs:** [English](outputs/modern-swe-study-guide-2026.pdf) · [မြန်မာ](outputs/modern-swe-study-guide-2026.my.pdf)

## The ten weeks

| Week | Topic | You build |
|---|---|---|
| 1 | The internals of coding agents | A 300–500 line terminal agent with four tools and full logging |
| 2 | Advanced context engineering | A one-page spec, one feature shipped through RePPIT, and an MCP server with 2–4 tools |
| 3 | Agent skills and the CLI | A packaged skill with a helper script, plus a browser-driven web skill |
| 4 | Customizing your agent and repository | Repository instructions, two hooks, and a planner / implementer / reviewer split |
| 5 | Agent-ready codebases | A scored readiness audit and the fixes that make a fresh agent productive |
| 6 | Agentic code review | A severity-ordered review rubric wired to pull requests, measured on five PRs |
| 7 | Security | A threat model, SAST / SCA / secret scans in CI, and a prompt-injection test |
| 8 | Background agents | An issue-to-PR flow with isolation, budgets, checkpoints, and retries |
| 9 | Building an AI-native team | A model gateway, an MCP portal, and a one-page adoption policy |
| 10 | The software factory and the future | A traced end-to-end factory with an eval set and a controlled improvement loop |

Then a capstone: an agentic maintenance system for a real repository.

## Repository layout

```
outputs/   the guide itself: English + Burmese markdown (source of truth) and the built PDFs
web/       the site (Next.js static export, PWA), deployed to Cloudflare Pages
work/      build_pdf.py (English PDF via reportlab) and the original audit notes
.scratch/  specs and translation working files
```

## Editing and publishing

English text lives in `outputs/modern-swe-study-guide-2026.md`; Burmese in `outputs/modern-swe-study-guide-2026.my.md`; Burmese UI strings (buttons, labels, About) in `web/content/ui.my.json`.

```bash
cd web
npm install
npm run dev                  # local preview at http://localhost:3000

# after editing the Burmese guide
npm run pdf -- --lang my     # regenerate the Burmese PDF (headless Chrome)
npm run release              # sync → static build → Cloudflare Pages deploy
```

English PDF (reportlab, needs uv):

```bash
cd work
uv run --python 3.12 --with reportlab python build_pdf.py ../outputs/modern-swe-study-guide-2026.md ../outputs/modern-swe-study-guide-2026.pdf
```

## How the site works

- `web/lib/guide.ts` parses the markdown at build time into pages: intro, ten weeks (focus, build, resource cards, done-when checklist), capstone, bookshelf, half-time path. Resource items become cards with type, duration, and author.
- All routes are prerendered; `output: "export"` produces `web/out/`, which Cloudflare Pages serves. Response headers are in `web/public/_headers`.
- The service worker (`web/scripts/sw.template.js`) precaches every page for offline use; progress is stored in `localStorage` only.
- `/print` and `/my/print` render the whole guide on one page; the Burmese PDF is printed from there because Myanmar script needs a real shaping engine.

## Burmese edition

Translated with Gemini from the English text, then edited by the author. Technical terms, tool names, and titles stay in English; durations use "min" and "h". If something reads wrong, the English edition is the reference.

## Credit

The ten-week structure and weekly topics follow the Fall 2026 syllabus of Stanford's CS146S, *The Modern Software Developer* ([themodernsoftware.dev](https://themodernsoftware.dev/)). This guide is independent and not affiliated with the course. Every linked resource belongs to its author; links were checked on September 4, 2026.
