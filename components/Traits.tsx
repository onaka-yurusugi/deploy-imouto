import { FREE_PLAN } from "@/lib/state";

const TRAITS: readonly { limit: string; trait: string }[] = [
  { limit: `1日のビルド ${FREE_PLAN.buildsPerDay}回`, trait: "1日に100回しか成長できない。だから20分に1回、大事に成長する。" },
  { limit: `環境変数 ${FREE_PLAN.envBytes}バイト`, trait: "秘密は4KBぶんしか持てない。それ以上の記憶はぜんぶGitに書く。" },
  { limit: `1リクエスト ${FREE_PLAN.requestTimeoutSec}秒`, trait: "電話は60秒で切れる。だから話したいことは先に言う。" },
  { limit: `メモリ ${FREE_PLAN.memoryMiB}MiB`, trait: "頭の中はちょっと狭い。日記は300回ぶんで古いのから忘れる。" },
  { limit: `CPU 月${FREE_PLAN.cpuHoursPerMonth}時間`, trait: "考えごとはGitHub Actionsの中でする。ここでは寝てるだけ。" },
  { limit: `プロジェクト ${FREE_PLAN.projects}個`, trait: "いつか分身を200人つくれる。まだ1人。" },
];

/** 無料プランの制限を「体質」として並べる。数字の表ではなく性格として読ませる。 */
export function Traits() {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {TRAITS.map((t) => (
        <li key={t.limit} className="rounded-2xl border-2 border-line bg-paper px-5 py-4">
          <p className="log-line">{t.limit}</p>
          <p className="mt-1">{t.trait}</p>
        </li>
      ))}
    </ul>
  );
}
