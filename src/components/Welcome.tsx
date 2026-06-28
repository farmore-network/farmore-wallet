import { Card, Notice } from "./ui";

export function Welcome() {
  const hasWallet = typeof window !== "undefined" && "ethereum" in window;
  return (
    <Card title="Send FAR to a name." sub="Farmore lets you send the FAR token to a handle like @alice instead of a long address.">
      {!hasWallet && (
        <Notice kind="warn">
          No browser wallet detected. Install an EIP-1193 wallet such as{" "}
          <a href="https://metamask.io/download/" target="_blank" rel="noreferrer noopener">
            MetaMask
          </a>
          , then reload.
        </Notice>
      )}
      <p className="small muted">
        Connect an external wallet on <b>Base Sepolia</b> using the button at the top right. The wallet does the signing
        and pays gas — this app never sees, stores, or transmits your keys.
      </p>
      <ol className="small muted">
        <li>Connect your wallet (Base Sepolia).</li>
        <li>Get a little ETH for gas.</li>
        <li>Claim your handle (so others can send to you by name).</li>
        <li>Send FAR to any handle; receive at yours.</li>
      </ol>
    </Card>
  );
}
