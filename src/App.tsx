import { useAccount } from "wagmi";
import { CHAIN_ID, MIXED_CONTENT, RESOLVER_URL } from "./config";
import { ConnectBar } from "./components/ConnectBar";
import { ConnectedApp } from "./components/ConnectedApp";
import { NetworkGuard } from "./components/NetworkGuard";
import { Welcome } from "./components/Welcome";
import { Notice } from "./components/ui";

export function App() {
  // Use the connected wallet's ACTUAL chain (useAccount), not the configured chain
  // (useChainId), so a wallet sitting on an unconfigured network (e.g. mainnet) is caught.
  const { address, isConnected, chainId } = useAccount();
  const wrongNetwork = isConnected && chainId !== CHAIN_ID;

  return (
    <>
      <div className="banner">
        ⚠️ <b>Testnet — fake money.</b> Never send real funds. FAR here is a testnet token with no value.
      </div>
      <div className="app">
        <header className="top">
          <div className="brand">
            <span className="dot" aria-hidden /> Farmore <small>testnet</small>
          </div>
          <ConnectBar />
        </header>

        {MIXED_CONTENT && (
          <Notice kind="warn">
            This page is served over HTTPS but the resolver (<span className="mono">{RESOLVER_URL}</span>) is HTTP, so the
            browser will block requests to it. Run the wallet over http locally, or put TLS/a domain in front of the
            resolver.
          </Notice>
        )}

        {!isConnected && <Welcome />}
        {isConnected && wrongNetwork && <NetworkGuard />}
        {isConnected && !wrongNetwork && address && <ConnectedApp key={address} address={address} />}

        <footer>
          Farmore reference wallet · Base Sepolia ({CHAIN_ID}) · signs with your external wallet, never holds keys.
          <br />
          Early test · single node · single chain · no audit. Fake money only — FAR is a solver reward, not an
          investment.
        </footer>
      </div>
    </>
  );
}
