/** Keep attribution inside a downloaded PNG without printing it over the card.
 * PNG iTXt supports the Unicode names in our translation/source notices. */
export function addPngAttribution(png: Uint8Array, text: string) {
  const end = png.length - 12;
  if (
    end < 8 ||
    png[0] !== 137 ||
    png[1] !== 80 ||
    String.fromCharCode(...png.slice(end + 4, end + 8)) !== "IEND"
  ) {
    throw new Error("Invalid PNG export");
  }
  const encoder = new TextEncoder();
  const body = encoder.encode(`Attribution\0\0\0\0\0${text}`);
  const chunk = new Uint8Array(body.length + 12);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, body.length);
  chunk.set(encoder.encode("iTXt"), 4);
  chunk.set(body, 8);
  let crc = 0xffffffff;
  for (const byte of chunk.subarray(4, chunk.length - 4)) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  view.setUint32(chunk.length - 4, (crc ^ 0xffffffff) >>> 0);
  const result = new Uint8Array(png.length + chunk.length);
  result.set(png.subarray(0, end));
  result.set(chunk, end);
  result.set(png.subarray(end), end + chunk.length);
  return result;
}
