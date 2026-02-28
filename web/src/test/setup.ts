import "@testing-library/jest-dom/vitest";

if (typeof globalThis.CSS === "undefined") {
  globalThis.CSS = {
    supports: () => false,
    escape: (s: string) => s,
  } as unknown as typeof CSS;
} else if (typeof globalThis.CSS.supports !== "function") {
  globalThis.CSS.supports = () => false;
}

if (typeof document.getAnimations !== "function") {
  document.getAnimations = () => [];
}

if (typeof Element.prototype.getAnimations !== "function") {
  Element.prototype.getAnimations = () => [];
}
