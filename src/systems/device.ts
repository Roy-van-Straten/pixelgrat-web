export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    // @ts-ignore vendor-specific
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore vendor-specific
    navigator.msMaxTouchPoints > 0
  );
}

export function isSmallScreen(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window.innerWidth;
  const h = window.innerHeight;
  return Math.min(w, h) <= 800; // treat typical phones as small
}

export function isMobileLike(): boolean {
  return isTouchDevice() || isSmallScreen();
}
