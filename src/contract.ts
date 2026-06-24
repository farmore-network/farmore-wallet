/**
 * Farmore Wallet — FROZEN INTERFACE CONTRACT (React app implemented next run).
 *
 * These types define the wallet's core model and flows so the UI, the SDK, and the
 * contracts agree. Milestone 2 builds the React application against this contract.
 *
 * Wallet promises (from the protocol page): one name, one balance, one account.
 *  - One name:    a single handle resolves to the user across every chain.
 *  - One balance: holdings aggregated across chains into one figure.
 *  - One account: self-custodial via passkey + threshold signing (no seed phrase).
 */

import type { Account, Amount, FarmoreClient, OrderStatus } from "@farmore-network/sdk";

/** A per-chain balance line that aggregates into the unified total. */
export interface ChainBalance {
  chainId: number;
  /** Logical asset, e.g. "USDC". */
  asset: string;
  /** Concrete token address on that chain. */
  token: `0x${string}`;
  /** Balance in base units. */
  amount: bigint;
  /** USD value (indexer-priced), if available. */
  usd?: number;
}

/** The unified balance view across all chains. */
export interface UnifiedBalance {
  totalUsd: number;
  byAsset: Record<string, bigint>;
  lines: ChainBalance[];
}

/** A self-custodial Farmore account: a handle plus its signing devices. */
export interface WalletAccount {
  handle: string;
  account: Account;
  /** Device public keys participating in the threshold signing quorum. */
  devices: Array<{ id: string; publicKey: string; addedAt: number }>;
  threshold: number;
}

/** The "send to a name" flow state machine. */
export type SendFlowStep =
  | { step: "compose"; toHandle: string; asset: string; amount: Amount }
  | { step: "resolved"; recipient: Account }
  | { step: "submitting"; orderId?: `0x${string}` }
  | { step: "fronted"; orderId: `0x${string}` }
  | { step: "settled"; orderId: `0x${string}`; status: OrderStatus };

/** Passkey / threshold auth surface (WebAuthn-backed; no seed phrase). */
export interface AuthProvider {
  /** Create a new account secured by a passkey and register its handle. */
  enroll(handle: string): Promise<WalletAccount>;
  /** Authenticate an existing device. */
  unlock(): Promise<WalletAccount>;
  /** Add a recovery device to the quorum. */
  addDevice(): Promise<WalletAccount>;
  /** Recover access using the remaining quorum when a device is lost. */
  recover(handle: string): Promise<WalletAccount>;
}

/** The wallet controller the UI binds to. FROZEN — implemented in Milestone 2. */
export interface WalletController {
  readonly auth: AuthProvider;
  readonly client: FarmoreClient;
  /** Current unified balance across chains. */
  balance(): Promise<UnifiedBalance>;
  /** Drive the send-to-handle flow, emitting steps as it progresses. */
  send(args: { toHandle: string; asset: string; amount: Amount }): AsyncIterable<SendFlowStep>;
  /** Sign in to a third-party app with the active handle. */
  signInWith(handle: string): Promise<{ token: string }>;
}
