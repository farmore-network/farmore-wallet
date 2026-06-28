import { useEffect, useRef, useState } from "react";
import { usePublicClient, useWriteContract } from "wagmi";
import { ABI, CHAIN_ID, CONTRACTS } from "../config";
import { addressToBytes32, errMessage, isZeroWord, validateHandle } from "../lib/handles";
import { resolver, ResolverError } from "../lib/resolver";

const ZERO = "0x0000000000000000000000000000000000000000";
import { AddressChip, Button, Card, Field, Notice, Pill } from "./ui";

type Avail =
  | { state: "idle" | "checking" | "available" }
  | { state: "yours"; owner: string }
  | { state: "taken"; owner: string }
  | { state: "error"; msg: string };

export function Identity({
  address,
  handle,
  setHandle,
}: {
  address: `0x${string}`;
  handle: string;
  setHandle: (h: string) => void;
}) {
  const pc = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [input, setInput] = useState(handle);
  const v = validateHandle(input);
  const candidate = v.ok ? v.value : "";

  const [avail, setAvail] = useState<Avail>({ state: "idle" });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const reqId = useRef(0);

  // Debounced availability check against the live resolver.
  useEffect(() => {
    if (!candidate) {
      setAvail({ state: "idle" });
      return;
    }
    const id = ++reqId.current;
    setAvail({ state: "checking" });
    const t = setTimeout(async () => {
      try {
        const acct = await resolver.resolve(candidate);
        if (id !== reqId.current) return;
        if (isZeroWord(acct.owner)) setAvail({ state: "available" });
        else if (acct.owner.toLowerCase() === address.toLowerCase()) setAvail({ state: "yours", owner: acct.owner });
        else setAvail({ state: "taken", owner: acct.owner });
      } catch (e) {
        if (id !== reqId.current) return;
        // 404 "handle not registered" means the name is free.
        if (e instanceof ResolverError && e.status === 404) setAvail({ state: "available" });
        else setAvail({ state: "error", msg: errMessage(e) });
      }
    }, 450);
    return () => clearTimeout(t);
  }, [candidate, address]);

  async function claim() {
    if (!v.ok || !pc) return;
    setError(null);
    setDone(false);
    try {
      // Re-check ownership just before writing. A 404 means it's unregistered (available).
      let owner = ZERO;
      try {
        owner = (await resolver.resolve(candidate)).owner;
      } catch (e) {
        if (!(e instanceof ResolverError && e.status === 404)) throw e;
      }
      const mine = !isZeroWord(owner) && owner.toLowerCase() === address.toLowerCase();
      if (!isZeroWord(owner) && !mine) {
        setError(`@${candidate} is already taken.`);
        return;
      }
      if (!mine) {
        setBusy("Registering @" + candidate + " — confirm in your wallet…");
        const h1 = await writeContractAsync({
          address: CONTRACTS.namespace,
          abi: ABI.namespace,
          functionName: "register",
          args: [candidate],
          chainId: CHAIN_ID,
        });
        await pc.waitForTransactionReceipt({ hash: h1 });
      }
      setBusy("Pointing @" + candidate + " at your wallet — confirm in your wallet…");
      const h2 = await writeContractAsync({
        address: CONTRACTS.namespace,
        abi: ABI.namespace,
        functionName: "setDefaultReceiver",
        args: [candidate, BigInt(CHAIN_ID), addressToBytes32(address)],
        chainId: CHAIN_ID,
      });
      await pc.waitForTransactionReceipt({ hash: h2 });

      setHandle(candidate);
      setDone(true);
      setAvail({ state: "yours", owner: address });
    } catch (e) {
      setError(errMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const canClaim =
    v.ok && !busy && (avail.state === "available" || avail.state === "yours");

  return (
    <Card title="Your identity" sub="Claim a handle and point it at this wallet so people can pay you by name.">
      {handle && (
        <Notice kind="ok">
          Your handle is <b>@{handle}</b>, receiving to <AddressChip address={address} /> on Base Sepolia.
        </Notice>
      )}

      <Field
        label="Handle"
        prefix="@"
        value={input}
        onChange={setInput}
        placeholder="e.g. alice"
        invalid={input.length > 0 && !v.ok}
      />
      {input.length > 0 && !v.ok && <p className="small" style={{ color: "var(--danger)" }}>{v.error}</p>}

      <div className="row" style={{ minHeight: 24 }}>
        {v.ok && avail.state === "checking" && <Pill>Checking availability…</Pill>}
        {v.ok && avail.state === "available" && <Pill kind="ok">@{candidate} is available</Pill>}
        {v.ok && avail.state === "yours" && <Pill kind="ok">You already own @{candidate}</Pill>}
        {v.ok && avail.state === "taken" && (
          <Pill kind="bad">
            @{candidate} is taken by&nbsp;<AddressChip address={(avail as { owner: string }).owner} />
          </Pill>
        )}
        {v.ok && avail.state === "error" && <Pill kind="warn">Couldn’t check: {(avail as { msg: string }).msg}</Pill>}
      </div>

      <div style={{ marginTop: 10 }}>
        <Button variant="primary" block pending={!!busy} disabled={!canClaim} onClick={claim}>
          {busy ?? (avail.state === "yours" ? `Re-point @${candidate} to this wallet` : `Claim @${candidate || "…"}`)}
        </Button>
      </div>

      {done && <Notice kind="ok">Done. @{candidate} now resolves to this wallet — you can receive by name.</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      <p className="small muted" style={{ marginTop: 12 }}>
        Claiming is two quick transactions (register, then set your receive address). Handles are first-come; squatting is
        expected in an open test.
      </p>
    </Card>
  );
}
