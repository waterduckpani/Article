// Shared client-side flag so the slide-in popup and the main signup form
// agree on whether this visitor has already joined. Stored per-browser.
const SUBSCRIBED_KEY = "article:subscribed";
const SUBSCRIBED_EVENT = "article:subscribed";
// The subscribe API also sets this cookie server-side; it outlives localStorage
// on mobile Safari (ITP), so we treat either signal as "subscribed".
const SUBSCRIBED_COOKIE = "article_subscribed";

function hasCookie(): boolean {
  try {
    return document.cookie
      .split("; ")
      .some((c) => c === `${SUBSCRIBED_COOKIE}=1`);
  } catch {
    return false;
  }
}

export function hasSubscribed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(SUBSCRIBED_KEY) === "1") return true;
  } catch {}
  return hasCookie();
}

export function markSubscribed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SUBSCRIBED_KEY, "1");
  } catch {}
  // Mirror into a cookie too, in case the API response cookie didn't stick
  // (e.g. the request failed but we optimistically marked locally).
  try {
    document.cookie = `${SUBSCRIBED_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  } catch {}
  // Tell any already-mounted components (e.g. the slide-in popup) right away,
  // so a subscribe via one form immediately suppresses the other.
  try {
    window.dispatchEvent(new Event(SUBSCRIBED_EVENT));
  } catch {}
}

// Run `cb` whenever this visitor subscribes — from this tab (custom event) or
// another tab (storage event). Returns an unsubscribe cleanup.
export function onSubscribed(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === SUBSCRIBED_KEY && e.newValue === "1") cb();
  };
  window.addEventListener(SUBSCRIBED_EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(SUBSCRIBED_EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}
