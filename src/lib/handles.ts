// Pure validation + encoding helpers. Framework-agnostic and unit-testable.
import { formatUnits, getAddress, pad, parseUnits, type Hex } from "viem";

// On-chain handle rules: lowercase [a-z0-9_], length 1..32, not digit-initial.
export const HANDLE_RE = /^[a-z_][a-z0-9_]{0,31}$/;

export type Validated<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateHandle(input: string): Validated<string> {
  const handle = input.trim().toLowerCase();
  if (handle.length === 0) return { ok: false, error: "Enter a handle." };
  if (handle.length > 32) return { ok: false, error: "Too long — max 32 characters." };
  if (/^[0-9]/.test(handle)) return { ok: false, error: "A handle can’t start with a digit." };
  if (!HANDLE_RE.test(handle)) return { ok: false, error: "Use only a–z, 0–9 and _ (lowercase)." };
  return { ok: true, value: handle };
}

export function parseAmount(input: string, decimals: number): Validated<bigint> {
  const s = input.trim();
  const m = s.match(/^\d+(?:\.(\d+))?$/);
  if (!m) return { ok: false, error: "Enter a positive number." };
  if ((m[1]?.length ?? 0) > decimals) return { ok: false, error: `Max ${decimals} decimal places.` };
  let value: bigint;
  try {
    value = parseUnits(s, decimals);
  } catch {
    return { ok: false, error: "Invalid amount." };
  }
  if (value <= 0n) return { ok: false, error: "Amount must be greater than zero." };
  return { ok: true, value };
}

/** Left-pad a 20-byte address into a 32-byte word (how the protocol carries addresses). */
export function addressToBytes32(address: string): Hex {
  return pad(getAddress(address), { size: 32 });
}

/** Take the trailing 20 bytes of a 32-byte word as a checksummed address. */
export function bytes32ToAddress(word: string): `0x${string}` {
  const hex = word.toLowerCase().replace(/^0x/, "").padStart(64, "0");
  return getAddress(("0x" + hex.slice(-40)) as Hex);
}

export function isZeroWord(word: string | undefined | null): boolean {
  return !word || /^0x0{1,64}$/i.test(word);
}

/** Display a base-unit bigint as a trimmed decimal string. */
export function fmtUnits(v: bigint | undefined | null, decimals: number, maxFrac = 4): string {
  if (v === undefined || v === null) return "—";
  const s = formatUnits(v, decimals);
  if (!s.includes(".")) return s;
  const [whole, frac] = s.split(".");
  const trimmed = frac.slice(0, maxFrac).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

export function shortAddr(a: string | undefined | null): string {
  if (!a) return "—";
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

export function errMessage(e: unknown): string {
  if (e && typeof e === "object") {
    const x = e as { shortMessage?: string; message?: string };
    if (x.shortMessage) return x.shortMessage;
    if (x.message) return x.message;
  }
  return String(e);
}
