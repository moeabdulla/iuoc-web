import { expect, it } from "vitest";
import { addPngAttribution } from "./png-attribution";
const png = new Uint8Array(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfqkAAAAASUVORK5CYII=",
    "base64",
  ),
);
it("adds an attribution chunk with a known CRC without altering existing PNG data", () => {
  const result = addPngAttribution(png, "hello");
  const offset = png.length - 12;
  expect(result.slice(0, offset)).toEqual(png.slice(0, offset));
  expect(result.slice(-12)).toEqual(png.slice(-12));
  const chunk = result.slice(offset, -12);
  expect(new TextDecoder().decode(chunk.slice(4, 8))).toBe("iTXt");
  expect(new DataView(chunk.buffer).getUint32(chunk.length - 4)).toBe(
    0x14efb6ee,
  );
});
it("preserves Unicode source names in uncompressed international text", () => {
  const result = addPngAttribution(png, "القرآن · Tanzil");
  expect(new TextDecoder().decode(result)).toContain("القرآن · Tanzil");
});
