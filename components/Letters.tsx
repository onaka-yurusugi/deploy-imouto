import type { Letter } from "@/lib/types";
import { formatJst } from "@/lib/time";

type Props = { letters: Letter[]; limit?: number };

export function Letters({ letters, limit }: Props) {
  const shown = [...letters].reverse().slice(0, limit ?? letters.length);
  if (shown.length === 0) {
    return <p className="text-ink-soft">まだ手紙は届いていません。最初の1通、入れてみる？</p>;
  }
  return (
    <ul className="flex flex-col gap-4">
      {shown.map((letter) => (
        <li key={letter.id} className="rounded-2xl border-2 border-line bg-paper p-5">
          <p className="text-xs text-ink-soft">
            {letter.from}（{letter.callName}） · {formatJst(letter.at)}
          </p>
          <p className="mt-1 whitespace-pre-wrap">{letter.body}</p>
          {letter.reply ? (
            <div className="mt-3 rounded-xl bg-pink-pale px-4 py-3">
              <p className="text-xs text-ink-soft">なうの返事（第{letter.repliedGeneration}回デプロイで）</p>
              <p className="mt-1 whitespace-pre-wrap">{letter.reply}</p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-ink-soft">返事はまだ。次のデプロイで書くね。</p>
          )}
        </li>
      ))}
    </ul>
  );
}
