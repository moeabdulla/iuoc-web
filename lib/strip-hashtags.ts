/**
 * Removes `#word` hashtag tokens from a video title (as commonly appended to
 * YouTube Shorts titles), collapsing any doubled whitespace and trimming a
 * leftover trailing separator (e.g. a dangling "-").
 *
 * If the title consists of nothing but hashtags, the original title is
 * returned unchanged rather than collapsing to an empty string.
 */
export function stripHashtags(title: string): string {
  const stripped = title
    .replace(/#\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[-–—:|]+$/, "")
    .trim();

  return stripped.length > 0 ? stripped : title;
}
