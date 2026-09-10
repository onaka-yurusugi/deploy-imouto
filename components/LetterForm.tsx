"use client";

import { useState, type FormEvent } from "react";
import { CALL_NAMES, type CallName } from "@/lib/types";
import { LETTER_LIMITS } from "@/lib/state";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/** お手紙ポスト。送った手紙は次のデプロイ（最大20分後）で妹に届く。 */
export function LetterForm() {
  const [from, setFrom] = useState("");
  const [callName, setCallName] = useState<CallName>("お兄ちゃん");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "sending" });
    const res = await fetch("/api/letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, callName, body }),
    });
    if (res.ok) {
      setStatus({ kind: "sent" });
      setBody("");
      return;
    }
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setStatus({ kind: "error", message: data?.error ?? "うまく入らなかった…" });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
        <label className="flex flex-col gap-1 text-sm">
          なまえ
          <input className="field" value={from} onChange={(e) => setFrom(e.target.value)} maxLength={LETTER_LIMITS.fromMax} required />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          なうからの呼び方
          <select className="field" value={callName} onChange={(e) => setCallName(e.target.value as CallName)}>
            {CALL_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        本文（{body.length}/{LETTER_LIMITS.bodyMax}）
        <textarea className="field min-h-28" value={body} onChange={(e) => setBody(e.target.value)} maxLength={LETTER_LIMITS.bodyMax} required />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button className="btn" type="submit" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "ポストに入れてる…" : "ポストに入れる"}
        </button>
        {status.kind === "sent" && <p className="text-sm text-mint font-bold">入った。次のデプロイで読むね（最大20分）</p>}
        {status.kind === "error" && <p className="text-sm text-pink-deep">{status.message}</p>}
      </div>
    </form>
  );
}
