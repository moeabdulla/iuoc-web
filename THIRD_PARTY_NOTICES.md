# Third-party content

The original application code and documentation use the MIT licence in `LICENSE`. Bundled third-party data keeps its own source terms and is not relicensed under MIT.

- **Arabic Quran text:** Tanzil Uthmani v1.1. Preserve [`TANZIL-NOTICE.txt`](public/quran/v1.1-b6/TANZIL-NOTICE.txt), attribution and the unchanged source text.
- **Tajweed annotations:** adapted from `cpfair/quran-tajweed` under CC BY 4.0. Source and adaptation details are in [`TAJWEED-NOTICE.txt`](public/quran/v1.1-b6/TAJWEED-NOTICE.txt).
- **Translations:** translator, source URL, version, attribution and source-reported licence are recorded per translation in [`catalog.json`](public/quran/v1.1-b6/catalog.json). They do not all use the same terms; retain that metadata when redistributing data.
- **YouTube:** catalogue metadata and embedded videos reference Project IUoC's channel. Video hosting remains with YouTube.
- **IUoC branding and courtyard artwork:** project-specific assets; no general reuse permission is asserted here.
- **Vendored agent skills:** retain the individual notices and licence files supplied with those tools.

The corpus export script reads the companion app's source database in read-only mode; a normal website build uses the already-exported files and does not require the app repository.
