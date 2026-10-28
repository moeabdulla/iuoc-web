/** Resolve the actual architectural layer, ignoring embedded tiny previews.
 * CSSOM may serialize image-set densities as either x or dppx. */
export function backgroundImageSource(background: string, dpr: number) {
  const candidates = Array.from(
    background.matchAll(
      /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)(?:\s+([\d.]+)(?:dppx|x))?/g,
    ),
  )
    .map((match) => ({
      url: (match[1] ?? match[2] ?? match[3]).trim(),
      density: Number(match[4] || 1),
    }))
    .filter(({ url }) => !url.startsWith("data:"));
  return (
    candidates.find(({ density }) => density >= dpr)?.url ??
    candidates.at(-1)?.url
  );
}

export function watchReadingReadiness(root: HTMLElement) {
  let disposed = false;
  root.dataset.sceneLoading = "pending";
  const art = root.querySelector<HTMLElement>(".reading-scene-art")!;
  const source = backgroundImageSource(
    getComputedStyle(art).backgroundImage,
    devicePixelRatio || 1,
  );
  const timer = window.setTimeout(() => {
    if (!disposed && root.dataset.sceneLoading !== "ready")
      root.dataset.sceneLoading = "slow";
  }, 10_000);
  const image = new Image();
  const artwork = source
    ? (() => {
        image.src = source;
        return image.decode();
      })()
    : Promise.resolve();
  void Promise.all([artwork, document.fonts.ready])
    .then(() => {
      if (!disposed) root.dataset.sceneLoading = "ready";
    })
    .catch(() => {
      /* Keep the explicit continue option if the image fails. */
    });
  return () => {
    disposed = true;
    window.clearTimeout(timer);
  };
}
