export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (window.self !== window.top) return; // inside Lovable/preview iframe — skip
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return; // skip in local dev

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  });
}
