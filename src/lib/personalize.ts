// Server-safe helpers for turning a raw, user-supplied name into something
// we can safely drop into an email greeting. Shared by the subscribe API,
// the newsletter send job, and the email templates.

/**
 * Normalize a raw name from a signup form into a clean first name, or null
 * if there's nothing usable. Takes only the first word, strips characters
 * that don't belong in a name, caps the length, and Title-Cases it.
 */
export function cleanFirstName(raw?: string | null): string | null {
  if (!raw) return null;

  const first = raw
    .trim()
    .split(/\s+/)[0] // first token only — "Bharat Khanna" → "Bharat"
    .replace(/[^\p{L}\p{M}'-]/gu, "") // letters, marks, apostrophes, hyphens
    .slice(0, 40);

  if (!first) return null;

  return first.charAt(0).toUpperCase() + first.slice(1);
}

/**
 * The name to address someone by in a greeting, with a friendly fallback
 * when we don't know their name. e.g. `Hi ${greetingName(name)},`
 */
export function greetingName(firstName?: string | null): string {
  return cleanFirstName(firstName) ?? "there";
}
