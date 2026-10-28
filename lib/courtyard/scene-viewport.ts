/** Browser toolbar height changes are not a new camera layout. Re-sample the
 * large viewport only when its width changes (rotation / window resizing). */
export function sceneViewportChanged(previousWidth: number, nextWidth: number) {
  return Math.abs(previousWidth - nextWidth) >= 1;
}

export function lockSceneViewport(
  home: HTMLElement,
  stage: HTMLElement,
  copy: HTMLElement,
  reserveScreen = true,
) {
  for (const name of [
    "--scene-height",
    "--scene-copy-top",
    "--scene-title-size",
  ])
    home.style.removeProperty(name);
  // Reserve the physical screen's CSS height too: even a browser that reports
  // lvh as its currently inset frame must have art ready when chrome retracts.
  const display = reserveScreen ? window.screen : undefined;
  const portrait = matchMedia("(orientation: portrait)").matches;
  const screenHeight = display
    ? portrait
      ? Math.max(display.width, display.height)
      : Math.min(display.width, display.height)
    : 0;
  const height = Math.max(stage.clientHeight, screenHeight);
  const top = getComputedStyle(copy).top;
  const titleSize = getComputedStyle(copy.querySelector("h1")!).fontSize;
  home.style.setProperty("--scene-height", `${height}px`);
  home.style.setProperty("--scene-copy-top", top);
  home.style.setProperty("--scene-title-size", titleSize);
}
