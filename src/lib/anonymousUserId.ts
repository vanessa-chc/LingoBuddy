/**
 * Anonymous user ID for history isolation: persisted in localStorage per device.
 * If localStorage is cleared, a new ID is generated and the user sees a fresh history.
 */

const STORAGE_KEY = "anonymous_user_id";

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns the current anonymous user ID. If none exists in localStorage (or storage
 * is unavailable/cleared), generates a new UUID and persists it.
 */
export function getOrCreateAnonymousUserId(): string {
  if (typeof window === "undefined") {
    return generateId();
  }
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id || id.trim() === "") {
      id = generateId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return generateId();
  }
}
