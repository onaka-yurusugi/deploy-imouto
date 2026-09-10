import Link from "next/link";
import { Hero } from "@/components/Hero";
import { DiaryLog } from "@/components/DiaryLog";
import { Letters } from "@/components/Letters";
import { LetterForm } from "@/components/LetterForm";
import { Traits } from "@/components/Traits";
import { imoutoState } from "@/lib/state";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-14">
      <Hero state={imoutoState} />

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-black">成長日記</h2>
          <Link href="/diary" className="text-sm font-bold text-pink-deep">
            ぜんぶ読む
          </Link>
        </div>
        <p className="text-sm text-ink-soft">デプロイ1回につき日記1本。20分おきに GitHub Actions が push して、デプロイナウが焼き直します。</p>
        <DiaryLog entries={imoutoState.diary} limit={3} />
      </section>

      <section id="post" className="flex flex-col gap-4 scroll-mt-8">
        <h2 className="text-xl font-black">お手紙ポスト</h2>
        <p className="text-sm text-ink-soft">
          手紙は GitHub の mailbox ブランチに1ファイルずつ投函されます。データベースはありません。次のデプロイでなうが読んで、返事を書きます。
        </p>
        <LetterForm />
        <h3 className="mt-4 font-bold">届いた手紙</h3>
        <Letters letters={imoutoState.letters} limit={5} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-black">なうの体質</h2>
        <p className="text-sm text-ink-soft">無料プランの制限は、ぜんぶ本人の設定として受け入れています。</p>
        <Traits />
      </section>
    </div>
  );
}
