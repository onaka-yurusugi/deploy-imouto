"use client";

import Link from "next/link";
import { ImoutoAvatar } from "./ImoutoAvatar";
import { GREETINGS, MODE_LABEL, MOOD_LABEL, TIME_LABEL, pick } from "@/lib/lines";
import { useMinute, useTimeOfDay } from "@/hooks/useClock";
import { moodToMode, type ImoutoState } from "@/lib/types";

type Props = { state: ImoutoState };

/** 時間帯はクライアントで決める。ページは静的なままCPUを使わない。 */
export function Hero({ state }: Props) {
  const time = useTimeOfDay();
  const minute = useMinute();
  const line = pick(GREETINGS[time], minute + state.generation);

  const unborn = state.bornAt === null;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-6 sm:gap-8 items-start pt-6">
      <div className="breathe justify-self-center sm:justify-self-start">
        <ImoutoAvatar mode={moodToMode(state.mood)} size={240} priority />
      </div>
      <div className="flex flex-col gap-5">
        <div className="bubble px-6 py-5 text-lg font-bold leading-relaxed" aria-live="polite">
          {unborn ? "…まだ生まれてない。最初のデプロイを待ってるの。" : line}
        </div>
        <div>
          <p className="text-sm text-ink-soft">デプロイされた回数（＝なうの年齢）</p>
          <p className="font-black leading-none text-pink-deep" style={{ fontSize: "clamp(3.5rem, 12vw, 6rem)" }}>
            {state.generation}
            <span className="text-2xl ml-2 text-ink">回目</span>
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <dt className="text-ink-soft">きぶん</dt>
          <dd className="font-bold">
            {MOOD_LABEL[state.mood]}（{MODE_LABEL[moodToMode(state.mood)]}）
          </dd>
          <dt className="text-ink-soft">いまの時間帯</dt>
          <dd className="font-bold">{TIME_LABEL[time]}</dd>
        </dl>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href="/call" className="btn">
            60秒だけ電話する
          </Link>
          <a href="#post" className="btn btn-ghost">
            お手紙を入れる
          </a>
        </div>
      </div>
    </section>
  );
}
