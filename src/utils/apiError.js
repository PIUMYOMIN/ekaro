/**
 * Extract a user-facing message from Laravel / axios error response bodies.
 */
export function parseApiErrorMessage(data) {
  if (data == null) return null;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data !== "object") return null;
  if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
  if (data.errors && typeof data.errors === "object") {
    const flat = Object.values(data.errors).flat();
    const first = flat[0];
    if (typeof first === "string") return first;
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  }
  return null;
}
