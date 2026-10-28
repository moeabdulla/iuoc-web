/** Reveal sharp artwork only after its renderer and fonts agree on layout.
 * Mobile waits on native image decoding and never starts a canvas renderer. */
export function watchSceneReadiness(home: HTMLElement) {
  let disposed = false;
  let fontsReady = document.fonts.status === "loaded";
  const images = Array.from(
    home.querySelectorAll<HTMLImageElement>(
      ".courtyard-background img, .entrance-stage img",
    ),
  );
  const decoding = new Map<HTMLImageElement, string>();
  const decoded = new Map<HTMLImageElement, string>();
  const finish = () => {
    if (!disposed) home.dataset.sceneLoading = "ready";
  };
  const check = () => {
    if (disposed) return;
    if (home.dataset.simpleEntrance === "true") {
      for (const image of images) {
        const src = image.currentSrc;
        if (
          !image.complete ||
          !image.naturalWidth ||
          !src ||
          decoding.get(image) === src
        )
          continue;
        decoding.set(image, src);
        void image
          .decode()
          .then(() => {
            if (disposed || image.currentSrc !== src) return;
            decoded.set(image, src);
            check();
          })
          .catch(() => {
            /* The slow-load escape remains available on failure. */
          });
      }
      if (
        fontsReady &&
        images.length > 0 &&
        images.every((image) => decoded.get(image) === image.currentSrc)
      )
        finish();
    } else if (fontsReady && home.dataset.scenePainted === "true") finish();
  };
  const observer = new MutationObserver(check);
  observer.observe(home, {
    attributes: true,
    attributeFilter: ["data-scene-painted", "data-simple-entrance"],
  });
  images.forEach((image) => image.addEventListener("load", check));
  void document.fonts.ready.then(() => {
    fontsReady = true;
    check();
  });
  // A failed download/context must not lock people out of the actual content.
  const timeout = window.setTimeout(() => {
    if (!disposed && home.dataset.sceneLoading !== "ready")
      home.dataset.sceneLoading = "slow";
  }, 10_000);
  check();
  return () => {
    disposed = true;
    observer.disconnect();
    images.forEach((image) => image.removeEventListener("load", check));
    window.clearTimeout(timeout);
  };
}
