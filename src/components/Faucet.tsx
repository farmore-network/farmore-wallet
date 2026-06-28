import { Card, Copy, Notice } from "./ui";

const ETH_FAUCETS: Array<[string, string]> = [
  ["Coinbase CDP", "https://portal.cdp.coinbase.com/products/faucet"],
  ["Chainlink", "https://faucets.chain.link/base-sepolia"],
  ["QuickNode", "https://faucet.quicknode.com/base/sepolia"],
];

export function Faucet({ address }: { address: `0x${string}` }) {
  return (
    <Card
      title="Get gas (ETH)"
      sub="You need a little Base Sepolia ETH to pay gas. FAR isn’t faucet-minted — it’s a reward earned by solvers, received when someone sends it to you."
    >
      <Notice kind="info">
        Open a faucet (new tab) and paste your address:
        <div className="row" style={{ marginTop: 6 }}>
          <span className="mono break grow">{address}</span>
          <Copy text={address} label="Copy address" />
        </div>
      </Notice>
      <div className="row">
        {ETH_FAUCETS.map(([name, url]) => (
          <a key={url} className="pill" href={url} target="_blank" rel="noreferrer noopener">
            {name} ↗
          </a>
        ))}
      </div>
    </Card>
  );
}
