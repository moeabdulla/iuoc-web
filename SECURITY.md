# Security

To report a potential vulnerability, contact **moe.s.abdulla@gmail.com** privately. Do not post credentials or user data in a public issue.

## Credential boundaries

- `.env.local`, `.vercel/`, signing keys and build output are ignored. `.env.example` contains placeholders only.
- `NEXT_PUBLIC_*` values are bundled into browser code. Only public endpoints and the site origin belong there.
- `YOUTUBE_API_KEY` belongs in Convex environment settings. Convex deployment keys and Vercel tokens belong in private deployment settings, never source files.
- Public Convex queries intentionally expose catalogue metadata. Ingestion, upserts and deletion helpers are internal functions; there is no public administrative write API.
- API responses, logs, screenshots and exported data should be checked before committing. Ignoring a file does not remove it from existing Git history.

## Local checks

```sh
bun run lint
bun run typecheck
bun run test
bun audit
# Optional, with Gitleaks installed:
gitleaks git . --log-opts='--all' --redact
```

These checks help catch mistakes but do not constitute a penetration test. If a real credential is ever committed, revoke/rotate it before considering publication or history cleanup.

The `typescript-eslint` override keeps the Next.js lint toolchain on the compatible 8.73+ release that uses patched minimatch. It does not add a runtime dependency. Revisit it when updating `eslint-config-next`.

## YouTube quota and public catalogue reads

The public site reads catalogue records from Convex; it does not proxy browser requests to the YouTube Data API. `ingest:run` and all import/write helpers are internal. The importer reads only the configured channel/uploads playlist, has a 15-second timeout per API request, rejects repeated page tokens and stops after 500 Data API requests per run. Failed or incomplete fetches abort before catalogue writes/deletion. These limits protect against accidental runaway imports, not an entitlement to consume someone else's quota.

Public queries validate counts and text lengths, cap requested page sizes and impose server-owned pagination read budgets. Featured lessons use an index. Catalogue endpoints remain public by design: bounds are not a guarantee against repeated-request flooding or provider costs.

Before deploying, restrict the Google key to **YouTube Data API v3** and review the project's quota/usage alerts in Google Cloud. Those provider settings cannot be verified from this repository. Do not use browser-referrer restrictions for a key used only by a server-side Convex action. Forks must supply their own backend and key; CORS and a hidden deployment URL are not authentication.

References: [Convex internal functions](https://docs.convex.dev/functions/internal-functions), [pagination read limits](https://docs.convex.dev/database/pagination), [Google API key guidance](https://docs.cloud.google.com/docs/authentication/api-keys-best-practices).
