# Article

**An automated AI-news publication.** Article ingests stories from across the
web on a schedule, rewrites and summarizes them with an LLM, publishes them to
a clean reading site, and emails a daily digest to subscribers — with no manual
editorial step in the loop.

🔗 **Live:** [www.articlenews.co](https://www.articlenews.co)

> This repository is public as part of my portfolio. It is **source-available,
> not open source** — please read the [License](#license) before doing anything
> with the code.

---

## What it does

- **Automated ingestion** — a scheduled job pulls articles from RSS feeds,
  deduplicates them by content hash, and scores them for quality.
- **AI rewriting** — each story is rewritten into a clean, plain-language title
  and summary via an LLM (through OpenRouter), then categorized.
- **Publishing** — published articles are served by a Next.js site with
  per-article pages, category pages, an archive, and an RSS feed.
- **Daily newsletter** — a scheduled job renders a digest of the latest
  articles and sends it to active subscribers via Resend.
- **SEO** — dynamic Open Graph images, sitemap/RSS, and metadata per article.

## Tech stack

| Layer        | Technology                                            |
| ------------ | ----------------------------------------------------- |
| Framework    | Next.js 16 (App Router) + React 19                    |
| Language     | TypeScript                                            |
| Styling      | Tailwind CSS 4                                         |
| Database     | Supabase (Postgres)                                   |
| AI           | OpenRouter (OpenAI-compatible client)                 |
| Email        | Resend + React Email                                  |
| Automation   | GitHub Actions (scheduled cron)                       |
| Hosting      | Vercel                                                 |

## Architecture

```
RSS feeds ──▶ ingest.ts (GitHub Actions, 2×/day)
                  │  dedupe · LLM rewrite · categorize · quality score
                  ▼
            Supabase (articles, subscribers)
                  │
        ┌─────────┴──────────┐
        ▼                    ▼
  Next.js site         send-newsletter (GitHub Actions, daily 07:00 IST)
 (articlenews.co)        renders digest · Resend batch send
```

### Key paths

- `src/lib/ingest.ts` — the ingestion + AI-rewrite pipeline (run by Actions).
- `src/lib/supabase.ts` — typed data-access helpers for the site.
- `src/app/` — the Next.js App Router site (home, article pages, category,
  archive, vault, legal pages, RSS feed).
- `src/app/api/subscribe/` — newsletter sign-up endpoint.
- `src/app/api/send-newsletter/` — secured endpoint that sends the daily digest.
- `emails/newsletter.tsx` — the React Email template.
- `.github/workflows/` — `ingest.yml` and `newsletter.yml` cron jobs.

## Automation

Two scheduled GitHub Actions drive the pipeline:

- **`ingest.yml`** — runs `tsx src/lib/ingest.ts` at 07:00 and 19:00 UTC.
- **`newsletter.yml`** — POSTs to `/api/send-newsletter` daily at 01:30 UTC
  (07:00 IST). The endpoint is protected by a shared `x-cron-secret` header.

## Environment

The app reads the following variables (set in Vercel for the site, and as
GitHub Actions secrets for the cron jobs). No values are committed.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY    # server-side / ingestion
OPENROUTER_API_KEY
RESEND_API_KEY
CRON_SECRET                  # shared secret for the newsletter endpoint
NEXT_PUBLIC_SITE_URL         # canonical site origin (use the www host)
```

## Local development

> The code is provided for viewing. Running it requires your own Supabase,
> OpenRouter, and Resend accounts, and is subject to the license below.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## License

This project is **source-available for portfolio viewing only — it is not open
source.** You may read the code to evaluate my work, but copying, modifying,
reusing, or redistributing it is not permitted without my written permission.
See [`LICENSE`](./LICENSE) for the full terms.

For permission requests: **bharatkhanna117@gmail.com**
