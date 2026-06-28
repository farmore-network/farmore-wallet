// Typed resolver client with timeouts and friendly error handling. Read-only HTTP;
// holds no secrets. All handle values are URL-encoded before use.
import { RESOLVER_URL } from "../config";

export class ResolverError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ResolverError";
    this.status = status;
  }
}

const TIMEOUT_MS = 12_000;

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  // Only send content-type when there's a body (POST). Adding it to a GET would force an
  // unnecessary CORS preflight in cross-origin (hosted) setups.
  const isWrite = (init?.method ?? "GET").toUpperCase() !== "GET";
  let res: Response;
  try {
    res = await fetch(`${RESOLVER_URL}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { ...(isWrite ? { "content-type": "application/json" } : {}), ...(init?.headers ?? {}) },
    });
  } catch (e) {
    clearTimeout(timer);
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new ResolverError("The resolver did not respond in time. It may be down — try again.");
    }
    throw new ResolverError("Couldn’t reach the resolver. Check your connection or the resolver URL.");
  }
  clearTimeout(timer);

  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }
  if (!res.ok) {
    const b = body as { error?: string; message?: string } | undefined;
    throw new ResolverError(b?.error || b?.message || text || `Resolver error (HTTP ${res.status}).`, res.status);
  }
  return body as T;
}

export interface ResolvedAccount {
  handle: string;
  node: `0x${string}`;
  owner: `0x${string}`;
  defaultChainId: number;
  defaultAddress: `0x${string}`; // 32-byte word
}

export interface SignInChallenge {
  handle: string;
  nonce: string;
  message: string;
}

export interface Health {
  status: string;
  chainId: number;
  namespace: string;
  settlement: string;
}

export const resolver = {
  health: () => call<Health>("/health"),
  resolve: (handle: string) => call<ResolvedAccount>(`/resolve/${encodeURIComponent(handle)}`),
  signinNonce: (handle: string) => call<SignInChallenge>(`/signin/${encodeURIComponent(handle)}/nonce`),
  signinVerify: (handle: string, signature: string) =>
    call<{ authenticated: boolean; handle: string; owner: string }>("/signin/verify", {
      method: "POST",
      body: JSON.stringify({ handle, signature }),
    }),
};
