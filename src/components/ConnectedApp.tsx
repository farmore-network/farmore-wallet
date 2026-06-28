import { useState } from "react";
import { FAR_TOKEN } from "../config";
import { useBalances } from "../hooks/useBalances";
import { useLocalState } from "../hooks/useLocalState";
import { fmtUnits } from "../lib/handles";
import { Activity, type ActivityItem } from "./Activity";
import { Faucet } from "./Faucet";
import { Identity } from "./Identity";
import { Receive } from "./Receive";
import { SendFar } from "./SendFar";
import { SignIn } from "./SignIn";

const TABS = ["Send", "Receive", "Identity", "Sign in", "Get gas", "Activity"] as const;
type Tab = (typeof TABS)[number];

export function ConnectedApp({ address }: { address: `0x${string}` }) {
  const [tab, setTab] = useState<Tab>("Send");
  const [handle, setHandle] = useLocalState<string>(`farmore:handle:${address}`, "");
  const [activity, setActivity] = useLocalState<ActivityItem[]>(`farmore:activity:${address}`, []);
  const bal = useBalances();

  const addActivity = (item: ActivityItem) =>
    setActivity((prev) => [item, ...prev.filter((a) => a.orderId !== item.orderId)].slice(0, 25));

  return (
    <>
      <div className="kpis" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="kpi">
          <div className="v">{fmtUnits(bal.far, FAR_TOKEN.decimals)}</div>
          <div className="l">FAR</div>
        </div>
        <div className="kpi">
          <div className="v">{fmtUnits(bal.eth, 18, 4)}</div>
          <div className="l">ETH · gas</div>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} className={t === tab ? "active" : ""} onClick={() => setTab(t)} role="tab" aria-selected={t === tab}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Send" && <SendFar farBalance={bal.far} onActivity={addActivity} />}
      {tab === "Receive" && <Receive address={address} handle={handle} far={bal.far} onRefresh={bal.refetch} goClaim={() => setTab("Identity")} />}
      {tab === "Identity" && <Identity address={address} handle={handle} setHandle={setHandle} />}
      {tab === "Sign in" && <SignIn defaultHandle={handle} />}
      {tab === "Get gas" && <Faucet address={address} />}
      {tab === "Activity" && <Activity items={activity} />}
    </>
  );
}
