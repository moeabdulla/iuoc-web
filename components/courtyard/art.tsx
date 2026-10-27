import { ReadyArtImage } from "./ready-art-image";
/* The decorative layers use explicit responsive variants and intrinsic sizes.
   No generated lettering or UI is painted into these images. */
/* eslint-disable @next/next/no-img-element */
export function CourtyardArt({
  name,
  widths,
  width,
  height,
  className = "",
  eager = false,
}: {
  name: string;
  widths: number[];
  width: number;
  height: number;
  className?: string;
  eager?: boolean;
}) {
  return (
    <ReadyArtImage
      className={className}
      src={`/courtyard/${name}-${widths[0]}.webp`}
      srcSet={widths
        .map((w) => `/courtyard/${name}-${w}.webp ${w}w`)
        .join(", ")}
      sizes={
        name === "interior-wide"
          ? "(max-aspect-ratio: 2/1) 300vh, 150vw"
          : name === "near-foliage"
            ? "(max-width: 700px) 55vw, 32vw"
            : name === "right-foliage"
              ? "(max-width: 700px) 30vw, 20vw"
              : "100vw"
      }
      width={width}
      height={height}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
    />
  );
}
export function ToolIcon({ name }: { name: string }) {
  return (
    <img
      src={`/courtyard/icon-${name}.svg`}
      width="70"
      height="94"
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
