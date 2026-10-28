/** Physical display sizing stays independent of Safari's expanding toolbars. */
export function displayHeight() {
  const { width, height } = window.screen;
  return matchMedia("(orientation: portrait)").matches
    ? Math.max(width, height)
    : Math.min(width, height);
}
