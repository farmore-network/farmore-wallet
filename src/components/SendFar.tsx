import { useState } from "react";
import { usePublicClient, useWriteContract } from "wagmi";
import { ABI, CHAIN_ID, CONTRACTS, FAR_TOKEN } from "../config";
import { bytes32ToAddress, errMessage, fmtUnits, isZeroWord, parseAmount, validateHandle } from "../lib/handles";
import { resolver } from "../lib/resolver";
import type { ActivityItem } from "./Activity";
import { AddressChip, Button, Card, Field, Notice, TxLink } from "./ui";

export function SendFar({
  farBalance,
  onActivity,
}: {
  farBalance: bigint | undefined;
  onActivity: (i: ActivityItem) => void;
}) {
  const pc = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("1");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ hash: `0x${string}`; to: `0x${string}`; amount: bigint } | null>(null);

  const hv = validateHandle(to);
  const av = parseAmount(amount, FAR_TOKEN.decimals);
  const insufficient = av.ok && farBalance !== undefined && av.value > farBalance;
  const canSend = hv.ok && av.ok && !insufficient && !busy && !!pc;

  async function send() {
    if (!hv.ok || !av.ok || !pc) return;
    setError(null);
    setDone(null);
    try {
      setBusy("Resolving @" + hv.value + "…");
      const acct = await resolver.resolve(hv.value);
      if (isZeroWord(acct.owner)) {
        setError(`@${hv.value} isn’t registered.`);
        return;
      }
      if (isZeroWord(acct.defaultAddress)) {
        setError(`@${hv.value} has no receive address set.`);
        return;
      }
      const recipient = bytes32ToAddress(acct.defaultAddress);

      setBusy("Transferring FAR — confirm in your wallet…");
      const hash = await writeContractAsync({
        address: CONTRACTS.far,
        abi: ABI.far,
        functionName: "transfer",
        args: [recipient, av.value],
        chainId: CHAIN_ID,
      });
      setBusy("Waiting for confirmation…");
      await pc.waitForTransactionReceipt({ hash });

      setDone({ hash, to: recipient, amount: av.value });
      onActivity({
        orderId: hash,
        toHandle: hv.value,
        amount: av.value.toString(),
        txHash: hash,
        status: 4,
        createdAt: Date.now(),
        asset: "FAR",
        kind: "transfer",
      });
    } catch (e) {
      setError(errMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card title="Send FAR" sub="FAR is a standard token (the solver reward). Send it directly to a handle — a plain ERC-20 transfer, not the solver flow.">
      <Notice kind="info">
        Your FAR balance: <b>{fmtUnits(farBalance, FAR_TOKEN.decimals)} FAR</b>. You can only send FAR you already hold.
      </Notice>

      <Field label="Recipient handle" prefix="@" value={to} onChange={setTo} placeholder="alice" invalid={to.length > 0 && !hv.ok} />
      {to.length > 0 && !hv.ok && <p className="small" style={{ color: "var(--danger)" }}>{hv.error}</p>}

      <Field label="Amount (FAR)" value={amount} onChange={setAmount} inputMode="decimal" invalid={amount.length > 0 && (!av.ok || insufficient)} />
      {amount.length > 0 && !av.ok && <p className="small" style={{ color: "var(--danger)" }}>{av.error}</p>}
      {insufficient && <p className="small" style={{ color: "var(--danger)" }}>You only have {fmtUnits(farBalance, FAR_TOKEN.decimals)} FAR.</p>}

      <Button variant="primary" block pending={!!busy} disabled={!canSend} onClick={send}>
        {busy ?? `Send ${av.ok ? fmtUnits(av.value, FAR_TOKEN.decimals) : ""} FAR to @${hv.ok ? hv.value : "…"}`}
      </Button>

      {done && (
        <Notice kind="ok">
          Sent {fmtUnits(done.amount, FAR_TOKEN.decimals)} FAR to <AddressChip address={done.to} />. <TxLink hash={done.hash} label="view tx" />
        </Notice>
      )}
      {error && <Notice kind="error">{error}</Notice>}

      <p className="small muted">
        This sends FAR straight from your wallet to the recipient’s address — instant, one transaction; you pay gas and
        the FAR.
      </p>
    </Card>
  );
}
