"use client";

import Link from "next/link";
import { ImoutoAvatar } from "./ImoutoAvatar";
import { Icon } from "./Icon";
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
    <section className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-8 sm:gap-10 items-start pt-8">
      <div className="breathe justify-self-center sm:justify-self-start sm:-rotate-2">
        <ImoutoAvatar mode={moodToMode(state.mood)} size={240} priority sparkles />
      </div>
      <div className="flex flex-col gap-5">
        <div className="bubble wobble-in px-6 py-5 text-lg font-bold leading-relaxed" aria-live="polite">
          {unborn ? "…まだ生まれてない。最初のデプロイを待ってるの。" : line}
        </div>
        <div className="card px-6 py-4 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="tag tag-peach">
              <Icon name="sprout" size={12} />
              デプロイされた回数（＝なうの年齢）
            </p>
            <p className="font-black leading-none text-pink-deep mt-2" style={{ fontSize: "clamp(3.5rem, 12vw, 5.5rem)" }}>
              {state.generation}
              <span className="text-2xl ml-2 text-ink">回目</span>
            </p>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-ink-soft">きぶん</dt>
            <dd className="font-bold">
              {MOOD_LABEL[state.mood]}
              <span className="tag ml-2">{MODE_LABEL[moodToMode(state.mood)]}</span>
            </dd>
            <dt className="text-ink-soft">いま</dt>
            <dd className="font-bold flex items-center gap-1">
              <Icon name={time === "night" ? "moon" : "sun"} size={14} className="text-yolk" />
              {TIME_LABEL[time]}
            </dd>
          </dl>
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href="/call" className="btn">
            <Icon name="phone" size={16} />
            60秒だけ電話する
          </Link>
          <a href="#post" className="btn btn-ghost">
            <Icon name="mail" size={16} />
            お手紙を入れる
          </a>
        </div>
      </div>
    </section>
  );
}
