// Shared client-side flag so the slide-in popup and the main signup form
// agree on whether this visitor has already joined. Stored per-browser.
const SUBSCRIBED_KEY = "article:subscribed";

export function hasSubscribed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SUBSCRIBED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSubscribed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SUBSCRIBED_KEY, "1");
  } catch {}
}
