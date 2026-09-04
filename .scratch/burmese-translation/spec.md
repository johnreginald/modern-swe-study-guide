# Burmese (Myanmar) translation of the Agentic Engineer Study Guide 2026

Status: Aligning (draft written 2026-09-04, not yet confirmed).

## Objective

Publish a Burmese edition of the guide, translated with Gemini, that is as trustworthy as the English one: identical structure, identical links, consistent technical vocabulary, readable Unicode Burmese on iOS and Android.

## Approach

1. **Translate the markdown source, not the site.** Input `outputs/agentic-engineer-study-guide-2026.md`, output `outputs/agentic-engineer-study-guide-2026.my.md`. PDF and site both build from it.
2. **Chunk by `##` section** (14 chunks, ~1–6k tokens each). One Gemini call per chunk with the full glossary in the system prompt. Small chunks keep structure intact and make retries cheap.
3. **Glossary first.** Ask Gemini to propose Burmese renderings for ~60 core terms (agent, context window, tool call, hook, skill, subagent, spec, MCP server, prompt injection, sandbox, gateway, eval, trace, pull request, code review, …). A native reader approves the glossary once; every chunk then uses it verbatim. Keep product names, repo paths, code, URLs, and acronyms in English; on first use write "Burmese (English)".
4. **Hard structural rules in the prompt:** keep every heading level, list marker, table pipe, bold marker, backtick span, and link `[text](url)` — translate link text, never the URL; keep durations "(59 min)" and the "Done when" heading text as a fixed Burmese string.
5. **Validate every chunk mechanically** before accepting it: same count of headings, list items, table rows, links; the set of URLs is identical; no Zawgyi code points (Unicode only); no untranslated paragraphs longer than N words. Re-run a chunk automatically if a check fails.
6. **Human pass.** Native review of Week 1 and the Home sections first; fix the glossary; then translate the rest. Budget: one evening of review for the full guide.
7. **Site:** `web/content/guide.my.md`; routes under `/my/...` mirroring English; `<html lang="my">`; `next/font` Noto Sans Myanmar with a Padauk / Myanmar Sangam MN fallback stack; line-height 1.8 and slightly larger base size for Burmese script; language switch in the top bar that remembers the choice; separate service-worker precache list; progress storage shared across languages.
8. **PDF:** `build_pdf.py` gains a `--lang my` mode using a Myanmar TTF (Noto Sans Myanmar); reportlab needs the font registered and Myanmar shaping is limited, so the PDF is best-effort and the site is the primary Burmese surface.

## Tooling

- `web/scripts/translate.mjs` (Node, `@google/genai`), model `gemini-2.5-pro` (or newer Pro), temperature 0.2, JSON-mode off, one request per chunk, cached to `.scratch/burmese-translation/chunks/*.md` so re-runs only redo failures.
- Env: `GEMINI_API_KEY` in `web/.env.local` (never committed).
- Estimated cost: ~40k input + ~60k output tokens per full pass, well under a dollar at 2026 Pro pricing; three passes with review still trivial.

## Open choices

1. Glossary style: transliterate technical terms (e.g. "အေးဂျင့်") or keep them in English inside Burmese sentences? Recommended: keep English for tool/product/protocol names and acronyms, translate concepts, and show the English in parentheses on first use per page.
2. Script: Unicode only (recommended). Zawgyi users get a one-line notice with a converter link.
3. Scope of v1: whole guide, or Home + Weeks 1–3 first as a pilot for the glossary? Recommended: pilot first.

## Done when

- Glossary approved by a native reader and stored at `.scratch/burmese-translation/glossary.md`.
- Every chunk passes the structural validator; URL set identical to English.
- `/my` routes render with correct fonts on iOS Safari and Android Chrome; language switch persists.
- Native reader signs off on Week 1 and the Home page.
