import { useState } from "react";
import { useSignMessage } from "wagmi";
import { errMessage, validateHandle } from "../lib/handles";
import { resolver } from "../lib/resolver";
import { AddressChip, Button, Card, Field, Notice } from "./ui";

export function SignIn({ defaultHandle }: { defaultHandle: string }) {
  const { signMessageAsync } = useSignMessage();
  const [handle, setHandle] = useState(defaultHandle);
  const v = validateHandle(handle);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);

  async function run() {
    if (!v.ok) return;
    setBusy(true);
    setError(null);
    setOwner(null);
    try {
      const challenge = await resolver.signinNonce(v.value);
      const signature = await signMessageAsync({ message: challenge.message });
      const res = await resolver.signinVerify(v.value, signature);
      if (!res.authenticated) {
        setError("Sign-in failed.");
        return;
      }
      setOwner(res.owner);
    } catch (e) {
      setError(errMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Sign in with your handle" sub="Prove handle ownership by signing a one-time challenge. No funds move; nothing is approved.">
      <Field label="Handle" prefix="@" value={handle} onChange={setHandle} placeholder="alice" invalid={handle.length > 0 && !v.ok} />
      {handle.length > 0 && !v.ok && <p className="small" style={{ color: "var(--danger)" }}>{v.error}</p>}

      <Button variant="primary" block pending={busy} disabled={!v.ok || busy} onClick={run}>
        {busy ? "Awaiting signature…" : `Sign in as @${v.ok ? v.value : "…"}`}
      </Button>

      {owner && (
        <Notice kind="ok">
          Signed in. Verified owner <AddressChip address={owner} /> for @{v.ok ? v.value : ""}.
        </Notice>
      )}
      {error && <Notice kind="error">{error}</Notice>}

      <p className="small muted">
        The wallet signs a message from the resolver; the resolver recovers the signer and checks it owns the handle
        on-chain. Sign-in only works from the wallet that owns the handle.
      </p>
    </Card>
  );
}
