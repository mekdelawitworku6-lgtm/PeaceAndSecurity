let accessToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setOnUnauthorized(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

export function onUnauthorized(): void {
  unauthorizedHandler?.();
}
