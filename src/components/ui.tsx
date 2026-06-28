// Small, dependency-free UI primitives. All text is rendered as text (React escapes it);
// no dangerouslySetInnerHTML anywhere.
import type { ReactNode } from "react";
import { useState } from "react";
import { EXPLORER } from "../config";
import { shortAddr } from "../lib/handles";

export function Card({ title, sub, children }: { title?: string; sub?: string; children: ReactNode }) {
  return (
    <section className="card">
      {title && <h2>{title}</h2>}
      {sub && <p className="sub">{sub}</p>}
      {children}
    </section>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  pending,
  variant = "default",
  block,
  small,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  pending?: boolean;
  variant?: "default" | "primary" | "ghost";
  block?: boolean;
  small?: boolean;
  type?: "button" | "submit";
}) {
  const cls = [variant === "primary" ? "primary" : variant === "ghost" ? "ghost" : "", block ? "block" : "", small ? "small" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled || pending}>
      {pending && <span className="spinner" aria-hidden />}
      {children}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  invalid,
  prefix,
  inputMode,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  invalid?: boolean;
  prefix?: string;
  inputMode?: "decimal" | "text";
  disabled?: boolean;
}) {
  const input = (
    <input
      className={`input ${invalid ? "bad" : ""}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      inputMode={inputMode}
      autoComplete="off"
      autoCapitalize="none"
      spellCheck={false}
      disabled={disabled}
    />
  );
  return (
    <label className="field">
      <span>{label}</span>
      {prefix ? (
        <div className={`input-prefix box ${invalid ? "bad" : ""}`}>
          <span className="at">{prefix}</span>
          {input}
        </div>
      ) : (
        input
      )}
    </label>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "warn" | "error" | "ok"; children: ReactNode }) {
  return <div className={`notice ${kind}`}>{children}</div>;
}

export function Pill({ kind, children }: { kind?: "ok" | "warn" | "bad"; children: ReactNode }) {
  return <span className={`pill ${kind ?? ""}`}>{children}</span>;
}

export function Copy({ text, label }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="ghost small"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {done ? "Copied" : (label ?? "Copy")}
    </button>
  );
}

export function AddressChip({ address }: { address?: string }) {
  if (!address) return <span className="muted">—</span>;
  return (
    <a className="mono small" href={`${EXPLORER}/address/${address}`} target="_blank" rel="noreferrer noopener">
      {shortAddr(address)}
    </a>
  );
}

export function TxLink({ hash, label }: { hash: string; label?: string }) {
  return (
    <a className="mono small" href={`${EXPLORER}/tx/${hash}`} target="_blank" rel="noreferrer noopener">
      {label ?? shortAddr(hash)}
    </a>
  );
}
