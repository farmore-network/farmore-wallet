import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { CHAIN, CHAIN_ID } from "../config";
import { errMessage, shortAddr } from "../lib/handles";
import { Button, Pill } from "./ui";

export function ConnectBar() {
  const { address, isConnected, chainId, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const [note, setNote] = useState<string | null>(null);

  const injected = connectors.find((c) => c.id === "injected") ?? connectors[0];
  const wrongNetwork = isConnected && chainId !== CHAIN_ID;

  // Ask the wallet to re-open its account picker. Not all wallets/versions surface a popup
  // for this (notably mobile), so we hint the always-works path (switch in the wallet itself).
  async function switchAccount() {
    setNote(null);
    try {
      if (!connector) throw new Error("no connector");
      const provider = (await connector.getProvider()) as {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
      await provider.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
      setNote("If no picker appeared, switch the active account in MetaMask — the wallet follows it.");
    } catch (e) {
      setNote("Switch the active account in MetaMask directly — the wallet will follow it. (" + errMessage(e) + ")");
    }
  }

  if (!isConnected) {
    return (
      <Button variant="primary" pending={isPending} onClick={() => injected && connect({ connector: injected })}>
        Connect wallet
      </Button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <div className="row">
        {wrongNetwork ? (
          <Button variant="primary" small pending={switching} onClick={() => switchChain({ chainId: CHAIN_ID })}>
            Switch to {CHAIN.name}
          </Button>
        ) : (
          <Pill kind="ok">● {CHAIN.name}</Pill>
        )}
        <Pill>{shortAddr(address)}</Pill>
        <Button variant="ghost" small onClick={switchAccount}>
          Switch
        </Button>
        <Button variant="ghost" small onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
      {note && (
        <span className="small" style={{ color: "var(--warn)", maxWidth: 300, textAlign: "right" }}>
          {note}
        </span>
      )}
    </div>
  );
}
