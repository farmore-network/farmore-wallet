import { useSwitchChain } from "wagmi";
import { CHAIN, CHAIN_ID } from "../config";
import { Button, Card, Notice } from "./ui";

export function NetworkGuard() {
  const { switchChain, isPending, error } = useSwitchChain();
  return (
    <Card title="Wrong network" sub={`Farmore testnet runs on ${CHAIN.name} (chain ${CHAIN_ID}). Switch your wallet to continue.`}>
      <Button variant="primary" pending={isPending} onClick={() => switchChain({ chainId: CHAIN_ID })}>
        Switch to {CHAIN.name}
      </Button>
      {error && <Notice kind="error">{error.message}</Notice>}
    </Card>
  );
}
