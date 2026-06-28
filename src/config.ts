// Single source of truth for chain, contract addresses, ABIs, and resolver URL.
// Addresses + ABIs come from the @farmore-network/contracts package (never hardcoded);
// the resolver URL comes from VITE_RESOLVER_URL with a safe default. Everything is
// validated at load so a misconfiguration fails fast and loudly instead of silently.
import { abis, addresses } from "@farmore-network/contracts";
import { type Abi, getAddress, isAddress } from "viem";
import { baseSepolia } from "viem/chains";

export const CHAIN = baseSepolia;
export const CHAIN_ID = baseSepolia.id; // 84532

const set = (addresses as Record<string, Record<string, string>>)[String(CHAIN_ID)];
if (!set) throw new Error(`No Farmore deployment for chain ${CHAIN_ID} in @farmore-network/contracts`);
if (Number(set.chainId) !== CHAIN_ID) throw new Error("Address set chainId mismatch");

function need(name: string): `0x${string}` {
  const a = set[name];
  if (!a || !isAddress(a)) throw new Error(`Invalid or missing contract address: ${name}`);
  return getAddress(a);
}

export const CONTRACTS = {
  namespace: need("namespace"),
  far: need("far"),
} as const;

const abiMap = abis as Record<string, Abi>;
export const ABI = {
  settlement: abiMap.Settlement,
  namespace: abiMap.Namespace,
  far: abiMap.FARToken,
} as const;

export const FAR_TOKEN = { symbol: "FAR", decimals: 18 } as const;

// Resolver base URL. Optional-chain import.meta.env so this module is also importable in
// plain Node (the integration test harness), where import.meta.env is undefined.
//   - dev (browser): default to the same-origin "/__resolver" path, which Vite proxies to
//     the real resolver — this avoids the browser's cross-origin (CORS) block.
//   - prod / Node: default to the absolute resolver URL.
// VITE_RESOLVER_URL overrides both.
const DEV = import.meta.env?.DEV === true;
const FALLBACK = DEV ? "/__resolver" : "http://84.8.134.52:8080";
export const RESOLVER_URL = (import.meta.env?.VITE_RESOLVER_URL ?? FALLBACK).replace(/\/+$/, "");
export const EXPLORER = "https://sepolia.basescan.org";

// True when the page is https but the resolver is http — browsers block such calls
// (mixed content). Surfaced in the UI so a tester isn't left guessing.
export const MIXED_CONTENT =
  typeof window !== "undefined" &&
  window.location.protocol === "https:" &&
  RESOLVER_URL.startsWith("http://");
