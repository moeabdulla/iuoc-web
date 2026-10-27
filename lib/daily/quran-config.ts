import catalog from "../../public/quran/v1.1-b6/catalog.json";
/** Match the IUoC app's src/lib/settings.ts default. */
export const DEFAULT_TRANSLATION_KEY = "english_rwwad";
export const DEFAULT_TRANSLATION = catalog.translations.find(
  (t) => t.key === DEFAULT_TRANSLATION_KEY,
)!;
