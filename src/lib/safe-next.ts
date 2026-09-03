const FALLBACK = "/perfil";

export function safeNextPath(
  next: string | undefined,
  origin: string,
  fallback = FALLBACK,
): string {
  if (!next) {
    return fallback;
  }
  if (next.includes("\\") || next.includes("\0")) {
    return fallback;
  }
  if (!next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  try {
    const resolved = new URL(next, origin);
    const expected = new URL(origin);
    if (resolved.origin !== expected.origin) {
      return fallback;
    }
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
