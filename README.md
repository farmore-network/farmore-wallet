# farmore-wallet

The self-custodial **Farmore wallet**: one name, one balance, one account. Send by
`@handle`, see a unified cross-chain balance, authenticate with a passkey + threshold
signing — no seed phrase.

> **Status: mainnet and the app are not live yet** (Milestone 2). No node, no bond, and no
> financial risk for users.

**Guide:** [Wallet User Guide](docs/USER-GUIDE.md) — for anyone; send by name, no
technical skill required.

> **Status: frozen interface contract.** [`src/contract.ts`](src/contract.ts) defines the
> wallet's core model (`WalletAccount`, `UnifiedBalance`, `SendFlowStep`, `AuthProvider`,
> `WalletController`) against the `@farmore-network/sdk`. The React application is
> implemented in Milestone 2 against this contract.

## What's fixed now

- **Account model** — handle + threshold-signing device quorum (passkey/WebAuthn).
- **Unified balance** — per-chain lines aggregated into one total.
- **Send flow** — `compose → resolved → submitting → fronted → settled` over the ERC-7683
  intent lifecycle, driven through the SDK.
- **Sign-in with handle** — verified against on-chain handle ownership.

## Develop

```bash
npm install
npm test     # tsc --noEmit type-checks the contract against the SDK
```

### Cross-repo dependency model

Depends on **`@farmore-network/sdk`** via a `file:` path to the sibling `../farmore-sdk`
checkout; `tsconfig.json` `paths` resolves the import to the SDK source for type-checking,
so no build ordering is required. Swap to the published range `"^0.1.0"` when releasing.
Install scripts are disabled (`.npmrc ignore-scripts=true`) for supply-chain safety.

## Next run

React + Vite app implementing `WalletController`; passkey enrollment / recovery; the
threshold signer; live balance indexing via the resolver.

## License

MIT — see [LICENSE](LICENSE).
