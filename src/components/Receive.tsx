import { FAR_TOKEN } from "../config";
import { fmtUnits } from "../lib/handles";
import { AddressChip, Button, Card, Copy, Notice } from "./ui";

export function Receive({
  address,
  handle,
  far,
  onRefresh,
  goClaim,
}: {
  address: `0x${string}`;
  handle: string;
  far: bigint | undefined;
  onRefresh: () => void;
  goClaim: () => void;
}) {
  return (
    <Card title="Receive" sub="FAR sent to your handle is delivered to your address.">
      {handle ? (
        <div className="item">
          <div className="row between">
            <span className="muted">Your handle</span>
            <b>@{handle}</b>
          </div>
          <div className="row between" style={{ marginTop: 6 }}>
            <span className="muted">Receive address</span>
            <AddressChip address={address} />
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <Copy text={handle} label="Copy handle" />
            <Copy text={address} label="Copy address" />
          </div>
        </div>
      ) : (
        <Notice kind="warn">
          You haven’t claimed a handle yet. <Button variant="ghost" small onClick={goClaim}>Claim one</Button> so people can
          send you FAR by name. You can still receive directly to your address: <span className="mono break">{address}</span>
        </Notice>
      )}

      <div className="item" style={{ marginTop: 10 }}>
        <div className="row between">
          <span className="muted">{FAR_TOKEN.symbol} balance</span>
          <b>
            {fmtUnits(far, FAR_TOKEN.decimals)} {FAR_TOKEN.symbol}
          </b>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <Button variant="ghost" small onClick={onRefresh}>
            Refresh balance
          </Button>
        </div>
      </div>

      <p className="small muted">
        When someone sends FAR to <b>@{handle || "yourhandle"}</b>, it arrives at this address.
      </p>
    </Card>
  );
}
