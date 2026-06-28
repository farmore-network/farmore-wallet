# Farmore Wallet — Tester Guide (Base Sepolia testnet)

A simple web wallet for sending the **FAR** token by handle on **Base Sepolia**, with **fake money**.

> ⚠️ **Testnet only. Never send real funds.** FAR here is a testnet token with no value.

The wallet **signs with your own external wallet** (e.g. MetaMask). It never sees, stores, or transmits your private key or seed.

> **About FAR:** FAR is the network's token — *issued* as a reward to node solvers (like a mining reward), and freely **sendable/receivable** like any ERC-20 once you hold it. This wallet sends FAR by handle via a direct on-chain transfer.

---

## For testers

You need a browser wallet — **[MetaMask](https://metamask.io/download/)** is easiest.

### One-time MetaMask setup
1. **Add Base Sepolia:** the wallet's **Switch to Base Sepolia** button will prompt MetaMask to add it. Or add manually — Network: `Base Sepolia` · RPC `https://sepolia.base.org` · Chain ID `84532` · Symbol `ETH` · Explorer `https://sepolia.basescan.org`.
2. **See FAR:** MetaMask → Tokens → **Import tokens** → Custom token → contract `0x4cAA55C51814E3989bc9B2A05C47AA2D075Ba9A0` (symbol `FAR`, 18 decimals).

### Use the wallet
1. **Open** the wallet, **Connect**, and **Switch to Base Sepolia** if prompted. Confirm the header shows your address and the top shows your **FAR** + **ETH** balances.
2. **Get gas** → grab a little **Base Sepolia ETH** from a faucet (you need it to pay gas). FAR isn't faucet-minted — you receive it from solver rewards or from someone sending it to you.
3. **Identity** → claim a handle (lowercase letters/numbers/_, e.g. `alice`) so others can send you FAR by name. Approve the two transactions.
4. **Send** → enter a handle + a FAR amount → **Send** → approve in MetaMask. It's instant (one transfer; you pay gas + the FAR).
5. **Receive** → shows your handle, address, and FAR balance. FAR sent to your handle arrives here.
6. **Activity** → your recent FAR sends with explorer links.
7. **Sign in** → prove you own a handle by signing a challenge (no funds move).

### What "good" looks like
- A green **"Sent … FAR"** confirmation with a tx link; your FAR balance drops; the recipient appears on the [FAR holders page](https://sepolia.basescan.org/token/0x4cAA55C51814E3989bc9B2A05C47AA2D075Ba9A0#balances).

### If something’s off
- **"Wrong network"** → Switch to Base Sepolia.
- **FAR shows 0** → make sure the **connected** account is the one holding FAR (the header address must match), and you're on Base Sepolia.
- **Tx fails** → usually you need a little more ETH for gas.
- **"Couldn’t reach the resolver"** → cross-origin/CORS; run locally (dev proxy) or use a host where the resolver is reachable (see below).

---

## For developers (run locally)

The contracts package supplies ABIs + addresses, so build it first:
```bash
cd farmore-contracts && npm run build      # builds @farmore-network/contracts dist
cd ../farmore-wallet && npm install && npm run dev   # http://localhost:5173
```

- **Resolver CORS:** the resolver doesn't send CORS headers, so the browser can't call it cross-origin. In dev the app calls `/__resolver/*` and **Vite proxies** it to the resolver (same-origin) — works out of the box. Override the proxy target with `VITE_RESOLVER_TARGET`. For hosting, either add CORS to the resolver or serve the wallet + resolver behind one origin, and set `VITE_RESOLVER_URL`.
- Scripts: `npm run typecheck`, `npm run build`, `npm run preview`.

### Live integration test
Exercises the wallet's real modules (resolver + validation) and does a real FAR transfer by handle on Base Sepolia. Use a testnet key that holds FAR and is **not** in use in MetaMask at the same time:
```bash
FAR_SENDER_KEY=0x<testnet key with FAR> npx tsx scripts/live-e2e.mts
```

---

## Architecture & security

- **Stack:** Vite + React + TypeScript, **wagmi + viem** for wallet connection and contract calls.
- **No custody:** signing/gas go through the user's external wallet (injected EIP-1193). The app holds no keys, seeds, or secrets — none in storage or logs.
- **Addresses & ABIs:** from `@farmore-network/contracts` (never hardcoded), validated at load; chain id pinned to 84532; the UI blocks the wrong network (checks the *wallet's* actual chain).
- **Input validation:** handles (`[a-z0-9_]`, 1–32, not digit-initial) and amounts validated before any call; addresses via viem.
- **Send FAR:** resolves the handle to its receive address, then a standard `FARToken.transfer` — one transaction, no solver.
- **XSS:** values render as text (React escaping); no `dangerouslySetInnerHTML`.

> Note: this wallet is scoped to **FAR** sends. The Farmore *payment* flow (send a payment asset by handle, delivered by a solver with optimistic settlement) still exists at the protocol level (contracts + resolver + node) and can be re-surfaced in the wallet later.

## Known limitations
- Testnet only; fake money.
- Single chain (Base Sepolia); resolver is HTTP/IP (no TLS) — fine for a closed test, not a public launch.
- No audit.
