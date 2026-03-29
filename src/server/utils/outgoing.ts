export interface OutgoingFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  redirect?: RequestRedirect;
  signal?: AbortSignal;
}

let allowedHosts: Set<string> | null = null;

export function setOutgoingAllowlist(hosts: string[]): void {
  if (!hosts || hosts.length === 0) {
    allowedHosts = new Set();
    return;
  }
  const normalized = hosts.map((h) => h.trim().toLowerCase()).filter(Boolean);
  const extra = process.env.TANSEEK_OUTGOING_ALLOWED_HOSTS ?? "";
  const fromEnv = extra
    .split(",")
    .map((h: string) => h.trim().toLowerCase())
    .filter(Boolean);
  allowedHosts = new Set([...normalized, ...fromEnv]);
}

export function isUrlAllowedForOutgoing(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return false;
  } catch {
    return false;
  }
  if (!allowedHosts) return true;
  if (allowedHosts.size === 0) return false;
  if (allowedHosts.has("*")) return true;
  const host = new URL(url).hostname.toLowerCase();
  return allowedHosts.has(host);
}

export async function outgoingFetch(
  url: string,
  options: OutgoingFetchOptions = {},
): Promise<Response> {
  const method = options.method ?? "GET";
  const redirect = options.redirect ?? "follow";
  const signal = options.signal;
  const headers = options.headers;
  const body = options.body;

  return fetch(url, { method, redirect, signal, headers, body });
}
