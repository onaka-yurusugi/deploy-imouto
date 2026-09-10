import type { Metadata } from "next";
import { DiaryLog } from "@/components/DiaryLog";
import { Letters } from "@/components/Letters";
import { imoutoState } from "@/lib/state";
import { daysSince, formatJst } from "@/lib/time";

export const metadata: Metadata = { title: "成長日記 | なう" };

export default function DiaryPage() {
  const born = imoutoState.bornAt;
  return (
    <div className="flex flex-col gap-10 pt-6">
      <section>
        <h1 className="text-2xl font-black">成長日記</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {born ? `${formatJst(born)} に生まれてから ${daysSince(born)} 日、${imoutoState.generation} 回デプロイされました。` : "まだ生まれていません。"}
        </p>
      </section>
      <DiaryLog entries={imoutoState.diary} />
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-black">届いた手紙ぜんぶ</h2>
        <Letters letters={imoutoState.letters} />
      </section>
    </div>
  );
}
