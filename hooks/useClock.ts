"use client";

import { useSyncExternalStore } from "react";
import { timeOfDay, type TimeOfDay } from "@/lib/time";

const TICK_MS = 60_000;

function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, TICK_MS);
  return () => clearInterval(id);
}

/** JSTの時間帯。サーバー描画は "day" 固定にしてハイドレーション差分を出さない。 */
export function useTimeOfDay(): TimeOfDay {
  return useSyncExternalStore(subscribe, () => timeOfDay(), () => "day");
}

/** 現在の「分」。定型セリフの選択シードに使う。 */
export function useMinute(): number {
  return useSyncExternalStore(subscribe, () => new Date().getMinutes(), () => 0);
}
