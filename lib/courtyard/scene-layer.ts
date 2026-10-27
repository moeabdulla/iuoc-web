/** Retire an offscreen scene layer instead of leaving a huge transform and
 * a permanent GPU-promotion hint attached to invisible artwork. Re-entering
 * layout forces fresh painting, which also avoids stale cached texture tiles. */
export function paintSceneLayer(
  element: HTMLElement,
  visible: boolean,
  transform: string,
) {
  if (visible) {
    element.style.transform = transform;
    element.style.willChange = "transform";
    element.style.visibility = "visible";
    element.style.display = "";
  } else {
    element.style.display = "none";
    element.style.visibility = "hidden";
    element.style.transform = "none";
    element.style.willChange = "auto";
  }
}
/** Geometry is read only on layout changes. Restore original boxes within the
 * same frame, then immediately paint the actual scroll pose before any paint. */
export function measureSceneLayer(element: HTMLElement) {
  element.style.display = "";
  element.style.transform = "none";
  element.style.willChange = "auto";
}

/** Diagnostic alternative: keep the bounded, already-offscreen plane resident.
 * No display/visibility/promotion transition when the scroll reverses. */
export function paintPersistentSceneLayer(
  element: HTMLElement,
  transform: string,
) {
  element.style.display = "";
  element.style.visibility = "visible";
  element.style.willChange = "transform";
  element.style.transform = transform;
}
