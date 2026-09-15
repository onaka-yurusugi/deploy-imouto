import Image from "next/image";
import type { Letter } from "@/lib/types";
import { MODE_IMAGE } from "@/lib/lines";
import { formatJst } from "@/lib/time";
import { Icon } from "./Icon";

type Props = { letters: Letter[]; limit?: number };

/** 届いた手紙。封筒っぽいカードに切手、返事はなうのミニ立ち絵つき。 */
export function Letters({ letters, limit }: Props) {
  const shown = [...letters].reverse().slice(0, limit ?? letters.length);
  if (shown.length === 0) {
    return (
      <p className="card px-6 py-5 text-ink-soft flex items-center gap-2">
        <Icon name="mail" size={18} className="text-pink" />
        まだ手紙は届いていません。最初の1通、入れてみる？
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-4">
      {shown.map((letter) => (
        <li key={letter.id} className="card card-lift p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold">
                {letter.from}
                <span className="tag tag-peach ml-2">{letter.callName}って呼ぶ</span>
              </p>
              <p className="log-line mt-0.5">{formatJst(letter.at)}</p>
            </div>
            <span className="stamp">
              <Icon name="heart" size={16} />
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap">{letter.body}</p>
          {letter.reply ? (
            <div className="mt-4 flex items-start gap-3">
              <Image src={MODE_IMAGE.tsundere} alt="" width={36} height={36} unoptimized className="rounded-full border-2 border-paper shadow-[var(--shadow-soft)] flex-none object-cover" />
              <div className="rounded-2xl rounded-tl-sm bg-pink-pale px-4 py-3 flex-1">
                <p className="text-xs text-ink-soft">なうの返事（第{letter.repliedGeneration}回デプロイで）</p>
                <p className="mt-1 whitespace-pre-wrap">{letter.reply}</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-ink-soft flex items-center gap-1">
              <Icon name="sprout" size={12} className="text-mint" />
              返事はまだ。次のデプロイで書くね。
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
