"use client";
/* eslint-disable @next/next/no-img-element -- responsive plates are pre-optimised */
import type { ImgHTMLAttributes } from "react";

/** Transparent loading previews must retire once the real alpha image is ready,
 * otherwise their enlarged soft edges remain visible behind the leaves. */
export function ReadyArtImage({
  alt = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      {...props}
      alt={alt}
      ref={(image) => {
        if (image?.complete && image.naturalWidth > 0)
          image.dataset.loaded = "true";
      }}
      onLoad={(event) => {
        event.currentTarget.dataset.loaded = "true";
      }}
    />
  );
}
