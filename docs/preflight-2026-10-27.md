# Local pre-commit check — October 27, 2026

Status: no remaining blocker found in the checked build and flows. Nothing staged, committed, pushed or deployed during this check. Preview runs on loopback port 5183.

## Fixes made during this pass

- Updated Next.js and its ESLint configuration to 16.4.3, PostCSS to 8.5.32 and Vitest to 4.1.12. Refreshed transitive dependencies while preserving the installed direct UI, React and Convex SDK versions. Removed unused npm-run-all2. Initial high/critical audit findings are cleared; final audit reports no vulnerabilities.
- Changed the public site URL fallback from localhost to https://iuoc.ca, matching the domain used by the app. NEXT_PUBLIC_SITE_URL remains available as an environment override. Browser verification confirmed the resulting Open Graph URL.
- Ignored local design masters, browser proofs and research prototypes in Git and ESLint. Approximately 281 MB of local exploration stays on disk outside the application commit; shipped WebP art, Quran corpus, source notices and runtime code remain included.

## Automated checks

- Production build and TypeScript passed using Next.js 16.4.3.
- 95 tests passed across 9 test files.
- ESLint passed with no errors or warnings for the shipping project.
- Dependency audit: no vulnerabilities found.
- Frozen-lockfile installation passed; Git diff whitespace check passed.
- All 799 Quran corpus manifest entries match their recorded SHA-256 hashes.
- Literal courtyard/brand asset references: no missing files found.
- Credential-pattern scan of 1,060 candidate text files: no matches found. This is a pattern check, not a comprehensive security certification; environment files remain ignored.

## Browser checks against the production build

- Desktop entrance button arrives at the library heading. Library → Quran → browser Back preserves a nonzero reading position; scrolling fully outward restores the entrance. Scrolling to the footer does not paint entrance steps over the interior.
- Light/dark controls and reduced-motion direct library access work. Original Dark/Normal preferences restored after the check.
- Library search reaches an unmatched empty state and Clear search restores lessons. Watch page presents its expected lesson and embedded player; series page renders its collection.
- Prayer times, daily question, About, App, Privacy, Support and custom 404 render without horizontal overflow or runtime alerts in the checked desktop viewport.
- Phone prayer city selection updates the displayed city and was restored to Ottawa. Geolocation permission was not requested.
- Phone direct Quran link opens and highlights 108:2 with the requested Pickthall translation. Bookmark save → change to surah 109 → Continue at bookmark → remove bookmark works; the test bookmark was removed.
- Tajweed control reveals 9 rule groups with 13 swatches each and renders coloured text runs. Original enabled/disabled preference restored.
- Phone menu opens, fits its viewport and navigates to Daily quote. Daily quote and share dialog fit the phone viewport.
- Final downloaded PNG is 1080px wide, opens successfully, has no visible source credit lines and retains its Attribution metadata. No external share target was sent a message.
- Browser error log at completion of the main route checks: no errors.

Local screenshots are in ignored `design/emerald-courtyard/v15/proofs/`, including phone sharing, menu and daily quote views. The earlier v13/v14 local proofs cover entrance restoration and full long-ayah export.

## Scope limits

This pass used the desktop in-app Chromium browser with desktop and phone-sized viewports. Native Safari/iOS share-target delivery, actual YouTube playback and external payments were not exercised. No cloud deployment or production environment configuration was changed.

## Dependency references

- https://github.com/advisories/GHSA-2464-fhr4-w9xw — patched Next.js/image processing versions.
- https://github.com/advisories/GHSA-2xp9-vwfh-vxw4 — AVIF optimization advisory.
- https://github.com/advisories/GHSA-vcvr-r3jv-pc5j — next/og advisory; this project does not use next/og for its share cards.
