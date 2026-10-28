"use client";

import Image, { type ImageProps } from "next/image";

/** Preserve the reserved image box while the sharp thumbnail/screenshot decodes.
 * Lazy images reveal individually, never delaying the page-level background. */
export function DecodedImage({ className = "", alt, ...props }: ImageProps) {
  const reveal = (image: HTMLImageElement) => {
    const source = image.currentSrc;
    void image
      .decode()
      .then(() => {
        if (image.currentSrc === source) image.dataset.assetReady = "true";
      })
      .catch(() => {
        image.dataset.assetFailed = "true";
      });
  };
  return (
    <Image
      {...props}
      alt={alt}
      className={`courtyard-decoded-image ${className}`}
      data-asset-ready="false"
      ref={(image) => {
        if (image?.complete && image.naturalWidth) reveal(image);
      }}
      onLoad={(event) => reveal(event.currentTarget)}
      onError={(event) => {
        event.currentTarget.dataset.assetFailed = "true";
      }}
    />
  );
}
