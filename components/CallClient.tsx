"use client";

import { useEffect, useRef, useState } from "react";
import { ImoutoAvatar } from "./ImoutoAvatar";
import { CALL_LIMIT_SEC } from "@/lib/state";
import { CALL_NAMES, MODES, moodToMode, type CallName, type ImoutoMode, type Mood } from "@/lib/types";
import { MODE_LABEL } from "@/lib/lines";

type Turn = { role: "user" | "assistant"; content: string };
type Phase = "idle" | "calling" | "ended";

const OPENING: Turn = { role: "user", content: "（電話をかけた）" };

/** 60秒通話。タイマーはクライアント、切断はサーバー（50秒）とクライアント（60秒）の二重。 */
export function CallClient({ mood }: { mood: Mood }) {
  const [mode, setMode] = useState<ImoutoMode>(moodToMode(mood));
  const [phase, setPhase] = useState<Phase>("idle");
  const [callName, setCallName] = useState<CallName>("お兄ちゃん");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState(CALL_LIMIT_SEC);
  const [speaking, setSpeaking] = useState(false);
  const startedAt = useRef<number>(0);
  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== "calling") return;
    const id = setInterval(() => {
      const left = Math.max(0, CALL_LIMIT_SEC - Math.floor((Date.now() - startedAt.current) / 1000));
      setRemaining(left);
      if (left === 0) hangUp();
    }, 250);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns]);

  function hangUp() {
    abortRef.current?.abort();
    setPhase("ended");
    setSpeaking(false);
  }

  async function speak(history: Turn[]) {
    setSpeaking(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const elapsedSec = Math.min(CALL_LIMIT_SEC, Math.floor((Date.now() - startedAt.current) / 1000));
    let reply = "";
    setTurns([...history, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callName, mode, elapsedSec, messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        reply = await res.text();
        setTurns([...history, { role: "assistant", content: reply }]);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const raw of events) {
          const eventLine = raw.split("\n").find((l) => l.startsWith("event: "));
          const dataLine = raw.split("\n").find((l) => l.startsWith("data: "));
          if (!eventLine || !dataLine) continue;
          const kind = eventLine.slice(7);
          const data = JSON.parse(dataLine.slice(6)) as string;
          if (kind === "text") reply += data;
          if (kind === "cut") reply += " …ぷつっ";
          if (kind === "error") reply += data;
          setTurns([...history, { role: "assistant", content: reply }]);
        }
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setTurns([...history, { role: "assistant", content: reply + " …もしもし？" }]);
      }
    } finally {
      setSpeaking(false);
    }
  }

  function startCall() {
    startedAt.current = Date.now();
    setRemaining(CALL_LIMIT_SEC);
    setTurns([]);
    setPhase("calling");
    void speak([OPENING]);
  }

  function send() {
    const text = input.trim();
    if (!text || speaking || phase !== "calling") return;
    setInput("");
    const history: Turn[] = [...turns.filter((t) => t.content.length > 0), { role: "user", content: text }];
    void speak(history);
  }

  const visibleTurns = turns.filter((t) => t !== OPENING && !(t.role === "user" && t.content === OPENING.content));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6 items-start">
      <div className="justify-self-center sm:justify-self-start">
        <ImoutoAvatar mode={mode} size={200} className={speaking ? "breathe" : ""} />
        <p className="mt-2 text-center font-black text-3xl text-pink-deep tabular-nums" aria-live="polite">
          {phase === "idle" ? "60" : remaining}
          <span className="text-sm text-ink ml-1">秒</span>
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {phase === "idle" && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              なうからの呼び方
              <select className="field max-w-xs" value={callName} onChange={(e) => setCallName(e.target.value as CallName)}>
                {CALL_NAMES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="flex flex-col gap-1 text-sm">
              <legend>きょうのなう</legend>
              <div className="flex flex-wrap gap-2">
                {MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={m === mode ? "btn" : "btn btn-ghost"}
                    aria-pressed={m === mode}
                  >
                    {MODE_LABEL[m]}
                  </button>
                ))}
              </div>
            </fieldset>
            <button className="btn self-start" onClick={startCall}>
              電話をかける
            </button>
          </>
        )}
        {phase !== "idle" && (
          <div ref={logRef} className="bubble px-5 py-4 h-72 overflow-y-auto flex flex-col gap-3" aria-live="polite">
            {visibleTurns.map((t, i) => (
              <p key={i} className={t.role === "user" ? "self-end rounded-2xl bg-pink-pale px-4 py-2 max-w-[85%]" : "max-w-[90%]"}>
                {t.content || "…"}
              </p>
            ))}
          </div>
        )}
        {phase === "calling" && (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input className="field" value={input} onChange={(e) => setInput(e.target.value)} placeholder="なにか話す" maxLength={200} disabled={speaking} />
            <button className="btn" type="submit" disabled={speaking || !input.trim()}>
              話す
            </button>
            <button className="btn btn-ghost" type="button" onClick={hangUp}>
              切る
            </button>
          </form>
        )}
        {phase === "ended" && (
          <div className="flex flex-col gap-2">
            <p className="text-ink-soft">通話が切れました。無料プランの1リクエストは60秒までなので、これが仕様です。</p>
            <button className="btn self-start" onClick={startCall}>
              もう一回かける
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
