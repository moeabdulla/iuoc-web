import { describe, expect, it } from "vitest";
import { stripHashtags } from "./strip-hashtags";

describe("stripHashtags", () => {
  it("removes trailing hashtags and trims the leftover separator", () => {
    expect(stripHashtags("Gambling - A Sin Made Common #skit #islam")).toBe(
      "Gambling - A Sin Made Common",
    );
  });

  it("removes multiple hashtags with mixed casing", () => {
    expect(
      stripHashtags("Allah is the Most Appreciative #islam #Allah #quran #hadith"),
    ).toBe("Allah is the Most Appreciative");
  });

  it("removes hashtags and trims a trailing dash separator", () => {
    expect(
      stripHashtags(
        "Why Does Allah Allow Evil to Exist - Part 6 #documentary #islam #Allah",
      ),
    ).toBe("Why Does Allah Allow Evil to Exist - Part 6");
  });

  it("collapses doubled whitespace left behind by removed hashtags", () => {
    expect(stripHashtags("A title #foo with hashtag in the middle #bar")).toBe(
      "A title with hashtag in the middle",
    );
  });

  it("falls back to the original title when it is only hashtags", () => {
    expect(stripHashtags("#islam #Allah #quran")).toBe("#islam #Allah #quran");
  });

  it("returns titles unchanged when there are no hashtags", () => {
    expect(stripHashtags("A Perfectly Normal Title")).toBe(
      "A Perfectly Normal Title",
    );
  });
});
