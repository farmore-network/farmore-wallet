/**
 * Live integration test for the FAR-only wallet's integration layer, against Base Sepolia.
 * Imports the SAME modules the app uses (resolver client, validation helpers) and performs a
 * real "send FAR to a handle" (resolve handle -> FARToken.transfer), then verifies the
 * recipient's FAR balance increased by exactly the amount.
 *
 * The signing key lives only here (a viem wallet client) — never in the app.
 *
 * Run from farmore-wallet/ with a testnet key that HOLDS FAR. Do NOT use an account you're
 * also signing with in MetaMask at the same time (nonce conflicts):
 *   FAR_SENDER_KEY=0x... npx tsx scripts/live-e2e.mts
 */
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

import { ABI, CONTRACTS, FAR_TOKEN, RESOLVER_URL } from "../src/config";
import { bytes32ToAddress, fmtUnits, isZeroWord, parseAmount, validateHandle } from "../src/lib/handles";
import { resolver } from "../src/lib/resolver";

const RPC = "https://sepolia.base.org";
const RECIPIENT_HANDLE = process.env.RECIPIENT_HANDLE ?? "alice";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error("ASSERT FAILED: " + msg);
}
const ok = (m: string) => console.log("  ✓ " + m);

async function main() {
  const pk = process.env.FAR_SENDER_KEY as `0x${string}` | undefined;
  assert(pk, "set FAR_SENDER_KEY (a testnet key that holds FAR)");
  const account = privateKeyToAccount(pk);
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
  const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC) });
  console.log(`resolver=${RESOLVER_URL}  sender=${account.address}`);

  console.log("\n[1] validation");
  assert(validateHandle("Alice").ok, "Alice -> alice");
  assert(!validateHandle("1bad").ok, "digit-initial rejected");
  const amt = parseAmount("1", FAR_TOKEN.decimals);
  assert(amt.ok && amt.value === 1_000_000_000_000_000_000n, "parseAmount 1 FAR -> 1e18");
  ok("handle + amount validation");

  console.log("\n[2] resolver");
  assert((await resolver.health()).chainId === 84532, "health chainId 84532");
  const acct = await resolver.resolve(RECIPIENT_HANDLE);
  assert(!isZeroWord(acct.owner) && !isZeroWord(acct.defaultAddress), `@${RECIPIENT_HANDLE} registered with a receive address`);
  const recipient = bytes32ToAddress(acct.defaultAddress);
  ok(`resolve @${RECIPIENT_HANDLE} -> ${recipient}`);

  console.log("\n[3] send FAR (wallet path: resolve -> FARToken.transfer)");
  const senderBal = (await publicClient.readContract({ address: CONTRACTS.far, abi: ABI.far, functionName: "balanceOf", args: [account.address] })) as bigint;
  assert(senderBal >= amt.value, `sender holds >= 1 FAR (has ${fmtUnits(senderBal, 18)})`);
  const before = (await publicClient.readContract({ address: CONTRACTS.far, abi: ABI.far, functionName: "balanceOf", args: [recipient] })) as bigint;
  const nonce = await publicClient.getTransactionCount({ address: account.address });
  const hash = await walletClient.writeContract({ address: CONTRACTS.far, abi: ABI.far, functionName: "transfer", args: [recipient, amt.value], nonce });
  await publicClient.waitForTransactionReceipt({ hash });
  const after = (await publicClient.readContract({ address: CONTRACTS.far, abi: ABI.far, functionName: "balanceOf", args: [recipient] })) as bigint;
  assert(after - before === amt.value, `recipient received exactly ${fmtUnits(amt.value, 18)} FAR`);
  ok(`sent; tx ${hash.slice(0, 12)}…; recipient +${fmtUnits(after - before, 18)} FAR`);

  console.log("\nPASS — FAR send-by-handle verified end-to-end against live Base Sepolia.");
}

main().catch((e) => {
  console.error("\nFAIL:", e instanceof Error ? e.message : e);
  process.exit(1);
});
