# Root-file cleanup

Reviewed 2026-11-17 at revision `6b139ef` with local cleanup changes. Goal: make the public repository easier to browse while retaining automatic tool discovery.

## Findings and decision

Biome combines formatting and linting in a shared configuration, so it may be the tool the owner remembers; that identification is uncertain. It does not consolidate framework, compiler, deployment, licensing and environment configuration. Migrating the working lint/format toolchain solely to reduce root files is not justified. [Biome quick start](https://biomejs.dev/installation/quick-start/).

Prettier supports a `prettier` property in `package.json`. The previous `.prettierrc` contained only `{}`. Moving that exact configuration preserves defaults and explicit project configuration discovery. Keep `.prettierignore`: it excludes generated code and vendored agent skills. [Prettier configuration](https://prettier.io/docs/configuration), [ignoring files](https://prettier.io/docs/ignore/).

Keep `AGENTS.md` as the shared instruction source. Move the existing Claude instructions into it without dropping rules, and leave `CLAUDE.md` as an `@AGENTS.md` import for compatibility with sessions that do not discover AGENTS directly. [Claude shared instructions](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools).

GitHub recognizes security policies under `.github/`, so relocating `SECURITY.md` there preserves its purpose. Third-party notices belong under `docs/`, with updated relative links. Keep `README.md` and `LICENSE` prominent at the root. [GitHub security policy locations](https://github.blog/security/vulnerability-research/coordinated-vulnerability-disclosure-cvd-open-source-projects/).

Retain the active configs: Next.js, TypeScript, Tailwind v3, PostCSS, Vercel, ESLint, and shadcn's `components.json` have distinct consumers. The shadcn file supports future CLI additions even though it is not a runtime dependency. Keep `bun.lock` and `skills-lock.json` for reproducibility rather than hiding or deleting lockfiles. [Next.js ESLint](https://nextjs.org/docs/app/api-reference/config/eslint), [shadcn config](https://ui.shadcn.com/docs/components-json).

## Local verification and limits

ESLint, TypeScript/Next route generation and whitespace checks pass. Prettier resolves `package.json`, returns the same empty options and produces identical output for `app/page.tsx`. Relative links in README and the moved notices resolve. No runtime application files changed; no UI screenshot or full application rebuild is needed for this document/config relocation. GitHub policy discovery after publication and Claude instruction loading in a new session were not remotely exercised. Changes remain local until explicitly approved for publication.

## Source register

All linked sources are official vendor documentation or GitHub's own engineering/security blog, accessed 2026-11-17. Publication dates are not supplied for the living documentation; the GitHub blog article is older guidance, corroborated by GitHub's current community-health-file documentation. Retained notes paraphrase sources rather than copying them.

Priorities: apply the small relocation/consolidation above; retain tool-specific discovery paths; revisit Biome only if there is a concrete tooling benefit, with rule-coverage and formatting comparisons before migration.
