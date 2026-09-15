import Link from "next/link";
import { Hero } from "@/components/Hero";
import { DiaryLog } from "@/components/DiaryLog";
import { Letters } from "@/components/Letters";
import { LetterForm } from "@/components/LetterForm";
import { Traits } from "@/components/Traits";
import { SectionTitle } from "@/components/SectionTitle";
import { imoutoState } from "@/lib/state";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <Hero state={imoutoState} />

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <SectionTitle icon="sprout">成長日記</SectionTitle>
          <Link href="/diary" className="nav-link text-sm text-pink-deep">
            ぜんぶ読む
          </Link>
        </div>
        <p className="text-sm text-ink-soft">デプロイ1回につき日記1本。20分おきに GitHub Actions が push して、デプロイナウが焼き直します。</p>
        <DiaryLog entries={imoutoState.diary} limit={3} />
      </section>

      <section id="post" className="flex flex-col gap-4 scroll-mt-8">
        <SectionTitle icon="mail">お手紙ポスト</SectionTitle>
        <p className="text-sm text-ink-soft">
          手紙は GitHub の mailbox ブランチに1ファイルずつ投函されます。データベースはありません。次のデプロイでなうが読んで、返事を書きます。
        </p>
        <LetterForm />
        <SectionTitle icon="heart" as="h3" className="mt-4">届いた手紙</SectionTitle>
        <Letters letters={imoutoState.letters} limit={5} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle icon="ribbon">なうの体質</SectionTitle>
        <p className="text-sm text-ink-soft">無料プランの制限は、ぜんぶ本人の設定として受け入れています。</p>
        <Traits />
      </section>
    </div>
  );
}
