import type { DiaryEntry } from "@/lib/types";
import { MOOD_LABEL } from "@/lib/lines";
import { formatJst } from "@/lib/time";

type Props = { entries: DiaryEntry[]; limit?: number };

/** デプロイログの見た目をした成長日記。1エントリ＝1デプロイ。 */
export function DiaryLog({ entries, limit }: Props) {
  const shown = [...entries].reverse().slice(0, limit ?? entries.length);
  if (shown.length === 0) {
    return (
      <div className="rounded-2xl bg-log p-5">
        <p className="log-line">$ lolipop deploy</p>
        <p className="mt-2 text-ink-soft">まだ1回もデプロイされていません。最初のデプロイで、なうが生まれます。</p>
      </div>
    );
  }
  return (
    <ol className="flex flex-col gap-3">
      {shown.map((entry) => (
        <li key={entry.generation} className="rounded-2xl bg-log px-5 py-4">
          <p className="log-line">
            deploy #{entry.generation} · {formatJst(entry.at)} · mood={entry.mood} · letters={entry.lettersRead}
          </p>
          <p className="mt-2 leading-relaxed">{entry.text}</p>
          <p className="mt-1 text-xs text-ink-soft">きぶん: {MOOD_LABEL[entry.mood]}</p>
        </li>
      ))}
    </ol>
  );
}
