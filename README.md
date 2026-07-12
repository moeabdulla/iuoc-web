# IUoC Web

The hub site for [Project IUoC](https://www.youtube.com/@ProjectIUoC) — free,
high-quality Islamic educational content, from Quran & Science to Philosophy
and Psychology, for everyone worldwide.

Live at [iuoc-web.vercel.app](https://iuoc-web.vercel.app).

## Stack

- **Next.js** (App Router) — server-rendered pages, ISR, SEO
- **Convex** — video/playlist catalog, full-text search, 12-hour YouTube
  ingestion cron
- **Tailwind CSS + shadcn/ui** — manuscript / illuminated-print design system
- **bun** — package management and scripts

## Development

```bash
bun install
bun run dev          # Next.js + Convex dev servers together
```

Other commands:

```bash
bunx convex dev --once     # push Convex functions/schema once
bunx vitest run            # unit tests
bun run lint               # eslint
bun run build              # production build
bunx convex run ingest:run # manually trigger YouTube ingestion
```

Copy `.env.local` values from the Convex dashboard (`CONVEX_DEPLOYMENT`,
`NEXT_PUBLIC_CONVEX_URL`) plus `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`, and
`YOUTUBE_UPLOADS_PLAYLIST_ID` for ingestion.

## Content curation

Video tags, featured flags, and playlist ordering/visibility are curated by
hand in the Convex dashboard. The ingestion cron never overwrites them.

## Deployment

Pushes to `main` deploy automatically via Vercel. Backend changes under
`convex/` are deployed with `bunx convex deploy`.
