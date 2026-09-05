# PWA site for the Modern Software Engineer Study Guide 2026

Status: Aligning → Ready once the two open choices below are confirmed.

## Objective

Publish `outputs/cs146s-2026-self-study-guide.md` as a mobile-first, installable, offline-capable website on Vercel, so the guide can be followed from a phone with per-week progress tracking. Single source of truth stays the markdown; the PDF and the site are both build outputs.

## Scope

In:
- Static site generator `work/build_site.py` (Python, same toolchain as `build_pdf.py`; markdown-it-py) → `site/` output.
- Pages: Home (intro, how to use, tooling, schedule tables), one page per Week 1–10, Capstone, Bookshelf, Half-time. Persistent bottom nav (Home / Weeks / Capstone / More) + week switcher.
- Mobile-first CSS, system font stack, light + dark via `prefers-color-scheme`, same navy/teal/amber palette as the PDF.
- Progress: every **Done when** bullet becomes a checkbox persisted in `localStorage`; Home shows a 10-week progress bar; per-week page shows N/M.
- Core-material items show their running time; a per-week "core ≈ X h" badge.
- External links open in new tab; video links get a small ▶ marker.
- PWA: `manifest.webmanifest` (name, icons, theme color, standalone), service worker precaching all pages/assets (cache-first, versioned by build hash), offline fallback page, "Add to Home Screen" hint on first visit (dismissable).
- Icons: generated 192/512 PNG + maskable + apple-touch-icon from a simple SVG mark.
- Vercel: `vercel.json` with static output dir, cache headers for SW (`Cache-Control: no-cache` on `sw.js`), security headers.
- Git: init repo at project root, `.gitignore` for `site/` build output if built on Vercel, or commit `site/` if deploying prebuilt (see open choice 2).

Out:
- No accounts, no server, no analytics, no sync across devices (localStorage only).
- No search (v1). No editing in the browser.
- No custom domain (default `*.vercel.app`).
- PDF rebuild is unchanged; not part of this item.

## Decisions (confirmed 2026-09-04)

1. **Generator**: Next.js (App Router, TypeScript, no Tailwind) in `web/`. Markdown parsed at build time by a Node script into per-section pages; all pages prerendered static. Replaces the Python-generator idea above; `site/` → `web/`.
2. **Deploy path**: git init at project root + private GitHub repo + `npx vercel --prod` from `web/` (Vercel builds Next.js). No git integration.
3. **Project name**: `modern-software-dev-guide` → `https://agentic-engineer-study-guide.vercel.app`.
4. Tracker: none (Raenil skipped for this project).

Status: **Done** (2026-09-04). Live at https://agentic-engineer-study-guide.vercel.app · repo https://github.com/johnreginald/agentic-engineer-study-guide (private) · Vercel project `modern-software-dev-guide` in team htet-wai-yan-soes-projects.

## Done when

- `uv run work/build_site.py` regenerates `site/` from the markdown with no manual edits.
- Lighthouse PWA installable on Chrome Android / Safari iOS (manifest + SW + icons + HTTPS).
- Airplane mode after first load: every page still opens.
- Ticking a Done-when box survives reload; Home progress bar reflects it.
- All 199 links present and open in a new tab.
- Deployed to `https://agentic-engineer-study-guide.vercel.app` from the CLI (done).
- Repo initialised with an initial commit containing generator, source markdown, PDF, and site output (or ignored, per choice 2).


## Revision 2026-09-04 (evening)

- Renamed to **Modern Software Engineer Study Guide 2026** everywhere (markdown, PDF cover/header/footer, site metadata, manifest, icons). Source file is now `outputs/modern-swe-study-guide-2026.md`.
- Removed every CS146S 2025 reference (coverage audit, schedule/guest tables, 2025 assignment map, "(2025 course reading)" markers, "Official sessions" lines, guest wording). Kept one credit paragraph to the CS146S Fall 2026 syllabus. Added "The ten weeks at a glance" table.
- Nav bug (Capstone/More not tappable, no way home on device): removed the fixed install banner and the blurred bottom bar; added a sticky top bar with Home / Weeks / Capstone / More; bottom nav is solid with z-index 50; install hint is now an inline card on Home.
- Formatting: markdown list items render as resource cards (type badge, duration chip, title link, author, one-line note), sections get jump chips, "Focus" and "You build" callouts on week pages.
