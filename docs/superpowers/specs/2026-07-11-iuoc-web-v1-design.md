# IUoC Web — v1 Design

Date: 2026-07-11
Status: Approved (pending final user review of this document)

## Overview

A public hub website for Project IUoC — a da'wah/educational media project producing
free Islamic educational content (Quran & Science, Philosophy, Psychology) on YouTube
and Instagram. The site is a browsable, searchable catalog of the channel's videos
organized by playlist categories, plus mission/about, socials, and donation links.

Out of scope for v1 (planned later): daily reminders, admin UI, newsletter,
AI-based categorization.

## Stack

- **Next.js** (App Router, server components) — SEO via server-rendered HTML
- **Convex** — data layer, cron ingestion, full-text search
- **Vercel** — hosting (hobby tier)
- **Tailwind CSS + shadcn/ui** — UI components
- **next-themes** — light/dark mode
- **bun** — package manager and script runner

Single Next.js app, no monorepo.

## Pages

| Route | Purpose |
|---|---|
| `/` | Hero (logo, mission line), featured + latest videos, category shortcuts, support CTA. Socials in site-wide footer. |
| `/videos` | Catalog: "Series" section (channel playlists — verified: 17 series covering ~106 of 659 videos) plus an "All Videos" grid covering the full catalog, with secondary-tag filters and a search bar. Server-rendered grid; search results update client-side. |
| `/videos/[slug]` | Per-video page: embedded YouTube player, description, category/tags, watch-on-YouTube link. Each video gets an indexable, shareable URL. |
| `/about` | Mission, story, what IUoC is. |
| `/support` | Donation links (Patreon, GoFundMe, PayPal) and all socials. |

## Data Model (Convex)

### `videos`
- `youtubeId` (unique), `slug` (unique, derived from title)
- `title`, `description`, `publishedAt`, `thumbnail`, `duration`
- `playlistIds` (references to playlists; primary categorization)
- `tags` (string array — manual secondary tags, set via Convex dashboard in v1)
- `featured` (boolean, manual)
- Full-text search index on `title` + `description`

### `playlists`
- `youtubeId` (unique), `title`, `description`, `thumbnail`
- `displayOrder` (manual), `visible` (boolean — hide unwanted playlists)

Manual fields (`tags`, `featured`, `displayOrder`, `visible`) are never overwritten
by ingestion.

Socials and donation URLs live in a config file in the repo, not the database.

## Ingestion Pipeline

- Convex cron every 12 hours runs an action:
  1. Fetch all channel playlists (YouTube Data API v3, key in Convex env vars)
  2. Fetch playlist items for each playlist
  3. Fetch the uploads playlist to catch videos not in any playlist
  4. Upsert videos and playlists into Convex
- First run backfills the entire catalog.
- Failure mode: on YouTube API error, keep existing data untouched; log and retry
  on next cron run. The site never depends on YouTube being reachable at request time.
- Quota: well under free daily limits (calls happen twice daily, not per visitor).

## Search

Convex full-text search index on video titles + descriptions. Search box on
`/videos` queries client-side (interactive), while category/tag browsing stays
server-rendered for SEO.

## Design Requirements

- Distinctive, editorial design per the frontend-design skill — explicitly not a
  generic AI-looking template.
- Brand identity from the logo: green crescent, red maple leaf. Light and dark
  mode using the two provided logo variants (black-text logo on light theme,
  white-text logo on dark theme).
- Mobile-first: all pages usable and verified at phone widths.
- Empty states designed in: the site renders sensibly before first ingestion.

## Error Handling

- Ingestion: idempotent upserts; API failure leaves data untouched; errors logged.
- Frontend: graceful empty states for missing data; video embed failure falls back
  to a YouTube link.

## Testing & Quality

- Unit tests on ingestion merge/upsert logic (manual fields never clobbered).
- Typecheck + lint gates.
- Browser verification of real UI at desktop and mobile widths before shipping.

## Future (explicitly deferred)

- Daily reminders (Convex foundation already in place)
- Admin UI for tags/featured/playlist ordering
- Newsletter, contact form
- AI-assisted categorization
