import sharp from "sharp";
import fs from "node:fs/promises";
const names = [
  "facade-1440",
  "facade-phone-640",
  "interior-wide-960",
  "reading-bay-1920",
];
let css =
  "/* Inline low-resolution plates are present with the first HTML/CSS paint. */\n";
for (const name of names) {
  const bytes = await sharp(`public/courtyard/${name}.webp`)
    .resize({ width: 96 })
    .webp({ quality: 55 })
    .toBuffer();
  const data = `url("data:image/webp;base64,${bytes.toString("base64")}")`;
  if (name === "facade-1440")
    css += `.facade-plane picture {background-image:${data};background-size:100% 100%;}\n`;
  if (name === "facade-phone-640")
    css += `@media(max-width:700px),(max-aspect-ratio:4/5){.facade-plane picture {background-image:${data};}}\n`;
  if (name === "interior-wide-960")
    css += `.courtyard-room-image{background-image:${data};background-size:cover;background-position:center;}\n`;
  if (name === "reading-bay-1920")
    css += `.reading-scene-art{--reading-preview:${data};background-image:image-set(url('/courtyard/reading-bay-1920.webp') 1x,url('/courtyard/reading-bay-2800.webp') 2x),var(--reading-preview);}\n`;
}
await fs.writeFile("components/courtyard/art-previews.css", css);

const g = JSON.parse(
  await fs.readFile("public/courtyard/geometry.json", "utf8"),
);
let projection =
  "\n/* Match the measured zero-scroll projection before hydration. */\n";
for (const [key, media] of [
  ["facade", null],
  ["facade-phone", "(max-width:700px), (max-aspect-ratio:4/5)"],
]) {
  const a = g[key],
    cx = (a.bounds[0] + a.bounds[2]) / 2,
    cy = (a.bounds[1] + a.bounds[3]) / 2;
  const phone = key === "facade-phone";
  const rule = `.courtyard-home{--scene-h:max(100svh,${phone ? "680" : "600"}px);--plane-w:max(100vw,calc((var(--scene-h) + ${phone ? "70" : "0"}px) * ${a.width / a.height}));--plane-h:calc(var(--plane-w) * ${a.height / a.width});--scene-x:calc((100vw - var(--plane-w)) / 2 + var(--plane-w) * ${cx} - 54vw);--scene-y:calc(var(--plane-h) * ${cy} - var(--scene-h) * .54);}\n.facade-plane{width:var(--plane-w);height:var(--plane-h);left:calc((100vw - var(--plane-w)) / 2);}\n.courtyard-room-image{width:108vw;height:calc(var(--scene-h) * 1.08);transform:translate(var(--scene-x),var(--scene-y));}\n`;
  projection += media ? `@media ${media}{${rule}}\n` : rule;
}
await fs.appendFile("components/courtyard/art-previews.css", projection);

for (const [name, selector] of [
  ["near-foliage-480", ".entrance-foliage-left .foliage-sway"],
  ["right-foliage-400", ".entrance-foliage-right .foliage-sway"],
  ["door-left-240", ".facade-doors .door-left"],
  ["door-right-240", ".facade-doors .door-right"],
]) {
  const bytes = await sharp(`public/courtyard/${name}.webp`)
    .resize({ width: 64 })
    .webp({ quality: 55 })
    .toBuffer();
  await fs.appendFile(
    "components/courtyard/art-previews.css",
    `${selector}{background:url("data:image/webp;base64,${bytes.toString("base64")}") center/100% 100% no-repeat;}\n`,
  );
}
