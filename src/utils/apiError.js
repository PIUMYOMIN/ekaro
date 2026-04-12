/**
 * Extract a user-facing message from Laravel / axios error response bodies.
 */
export function parseApiErrorMessage(data) {
  if (data == null) return null;
  if (typeof data === "string") {
    const s = data.trim();
    if (!s) return null;
    // HTML error page (wrong API URL, proxy, PHP fatal) — avoid dumping markup
    if (s.startsWith("<!") || s.startsWith("<html")) {
      return "The API returned an error page instead of JSON. Check VITE_API_URL and that the Laravel API is running.";
    }
    return s.length > 280 ? s.slice(0, 280) + "…" : s;
  }
  if (typeof data !== "object") return null;
  if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
  // Laravel debug JSON sometimes nests message
  if (data.message && typeof data.message === "object" && typeof data.message.message === "string") {
    return data.message.message.trim();
  }
  if (data.errors && typeof data.errors === "object") {
    const flat = Object.values(data.errors).flat();
    const first = flat[0];
    if (typeof first === "string") return first;
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  }
  return null;
}
