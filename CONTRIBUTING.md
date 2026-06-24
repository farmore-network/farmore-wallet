# Contributing to @farmore-network/wallet

Farmore is permissionless — integrations and contributions are welcome from anyone.

## Ground rules

- **Never commit secrets.** No private keys, `.env`, or API keys in git history. A
  `gitleaks` pre-commit hook and CI gate enforce this:
  ```bash
  pipx install pre-commit && pre-commit install
  ```
- **Supply-chain safety.** Dependency install scripts are disabled (`.npmrc
  ignore-scripts=true`). Keep `package-lock.json` committed; `npm audit` runs in CI and
  Dependabot is enabled.
- **Keep the interface contract type-checking** (`npm test`) green; don't break the frozen
  public API without a version bump and changelog.

## Workflow

1. Fork and branch from `main`.
2. `npm install`, make changes, `npm test`.
3. Open a PR with a clear description; sign your commits (`git commit -S`).
