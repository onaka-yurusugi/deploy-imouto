import type { DiaryEntry } from "@/lib/types";
import { MOOD_LABEL } from "@/lib/lines";
import { formatJst } from "@/lib/time";
import { Icon } from "./Icon";

type Props = { entries: DiaryEntry[]; limit?: number };

/** 成長日記。1エントリ＝1デプロイ。左に日付スタンプ、右に本文。 */
export function DiaryLog({ entries, limit }: Props) {
  const shown = [...entries].reverse().slice(0, limit ?? entries.length);
  if (shown.length === 0) {
    return (
      <div className="card px-6 py-5">
        <p className="log-line">$ lolipop deploy</p>
        <p className="mt-2 text-ink-soft">まだ1回もデプロイされていません。最初のデプロイで、なうが生まれます。</p>
      </div>
    );
  }
  return (
    <ol className="flex flex-col gap-4">
      {shown.map((entry) => (
        <li key={entry.generation} className="card card-lift px-5 py-4 sm:px-6 sm:py-5 grid grid-cols-[auto_1fr] gap-4 items-start">
          <div className="flex flex-col items-center gap-1 pt-1">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-pink-pale text-pink-deep font-black leading-none text-sm">
              <span className="text-[0.6rem] font-bold opacity-70">#</span>
              {entry.generation}
            </span>
            <Icon name="sprout" size={14} className="text-mint" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tag">{MOOD_LABEL[entry.mood]}</span>
              {entry.lettersRead > 0 && (
                <span className="tag tag-mint">
                  <Icon name="mail" size={11} />
                  手紙 {entry.lettersRead}通
                </span>
              )}
              <span className="log-line ml-auto">{formatJst(entry.at)}</span>
            </div>
            <p className="mt-2 leading-relaxed">{entry.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
