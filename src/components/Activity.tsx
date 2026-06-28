import { FAR_TOKEN } from "../config";
import { fmtUnits } from "../lib/handles";
import { Card, Notice, Pill, TxLink } from "./ui";

export interface ActivityItem {
  orderId: string; // tx hash used as id for FAR transfers
  toHandle: string;
  amount: string; // base units
  txHash: string;
  status: number;
  createdAt: number;
  asset?: "FAR";
  kind?: "transfer";
}

export function Activity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <Card title="Activity">
        <Notice kind="info">No sends yet. Your FAR sends will appear here.</Notice>
      </Card>
    );
  }
  return (
    <Card title="Activity" sub="Your recent FAR sends.">
      <div className="list">
        {items.map((it) => (
          <div className="item" key={it.orderId}>
            <div className="row between">
              <b>@{it.toHandle}</b>
              <span>
                {fmtUnits(BigInt(it.amount), FAR_TOKEN.decimals)} {FAR_TOKEN.symbol}
              </span>
            </div>
            <div className="row between small" style={{ marginTop: 6 }}>
              <Pill kind="ok">Sent</Pill>
              <TxLink hash={it.txHash} label="open tx" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
