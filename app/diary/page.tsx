import type { Metadata } from "next";
import { DiaryLog } from "@/components/DiaryLog";
import { Letters } from "@/components/Letters";
import { imoutoState } from "@/lib/state";
import { daysSince, formatJst } from "@/lib/time";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = { title: "成長日記 | なう" };

export default function DiaryPage() {
  const born = imoutoState.bornAt;
  return (
    <div className="flex flex-col gap-10 pt-6">
      <section>
        <SectionTitle icon="sprout" as="h1">成長日記</SectionTitle>
        <p className="mt-2 text-sm text-ink-soft">
          {born ? `${formatJst(born)} に生まれてから ${daysSince(born)} 日、${imoutoState.generation} 回デプロイされました。` : "まだ生まれていません。"}
        </p>
      </section>
      <DiaryLog entries={imoutoState.diary} />
      <section className="flex flex-col gap-4">
        <SectionTitle icon="mail">届いた手紙ぜんぶ</SectionTitle>
        <Letters letters={imoutoState.letters} />
      </section>
    </div>
  );
}
