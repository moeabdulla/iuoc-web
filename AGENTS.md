# Working instructions

## Git Rules

- Never commit or push unless explicitly asked to.
- No AI self-attribution: no `Co-Authored-By: Claude`, no "Generated with Claude Code" lines in commits or PRs.
- Never force-push, amend published commits, or rewrite history without explicit approval.
- Don't create branches, tags, or PRs unless asked.

## Project Overview

Project IUoC Web is the hub site for the Project IUoC YouTube channel: a
free Islamic-education video catalog (home, searchable/filterable video
library, individual video pages, about, and support/donation pages), built
with Next.js 16 (App Router) and Convex as the backend, styled with
Tailwind CSS v3 and shadcn/ui components. The Convex `videos` and
`playlists` tables are kept in sync with YouTube via a periodic ingestion
job. Package management and scripts run through bun.

## Commands

```bash
bun run dev                  # start Next.js + Convex dev servers together
bunx convex dev --once       # push Convex functions/schema once, no watch
bunx vitest run               # run the unit test suite
bun run lint                  # eslint
bun run build                 # production build
bunx convex run ingest:run    # manually trigger the YouTube ingestion job
```

## Manual Curation

`videos.tags`, `videos.featured`, `playlists.displayOrder`, and
`playlists.visible` are curated by hand through the Convex dashboard —
there is no admin UI yet. The ingestion cron (`convex/crons.ts`, four times daily at fixed UTC times) only adds/updates video and playlist metadata from YouTube; it
never overwrites these curation fields, so manual edits persist across
ingestion runs.

## Deploy

`NEXT_PUBLIC_SITE_URL` overrides the site origin used for canonical URLs,
sitemap and metadata; the default is `https://iuoc.ca`. To ship backend changes to the
production Convex deployment, run `bunx convex deploy`.


<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
