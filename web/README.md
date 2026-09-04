# Agent Engineer Study Guide 2026 — web app

Mobile-first, installable, offline-capable companion to the guide. Next.js App Router, no framework CSS.

Source of truth is `../outputs/agent-engineer-study-guide-2026.md`. This app keeps a committed copy in `content/guide.md` (and the PDF in `public/`) so it builds on Vercel without the rest of the repo.

```bash
npm run sync      # copy the latest markdown + PDF from ../outputs
npm run dev       # local dev
npm run build     # prebuild writes public/sw.js with a fresh cache version
npx vercel --prod # deploy (project: modern-software-dev-guide)
```

How it works:

- `lib/guide.ts` parses the markdown at build time: intro, home sections, ten weeks (focus, sessions, core time, body, "Done when" list), capstone, bookshelf, half-time.
- Every page is prerendered. "Done when" bullets become checkboxes persisted in `localStorage`; the Home and Weeks pages show progress.
- `scripts/sw.template.js` → `public/sw.js`: precaches all routes, cache-first for `/_next/static`, network-first for navigations and RSC payloads, `/offline` fallback.
- `app/manifest.ts` serves the web app manifest; icons live in `public/icons/`.
