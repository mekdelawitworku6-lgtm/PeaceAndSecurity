/**
 * Minimal API client stub for mock mode.
 * The real axios client is not needed — all API files return mock data directly.
 * This file only exports the handleError utility used by store slices.
 */

export function handleError(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Something went wrong";
}
