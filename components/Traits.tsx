import { FREE_PLAN } from "@/lib/state";
import { Icon, type IconName } from "./Icon";

const TRAITS: readonly { limit: string; trait: string; icon: IconName; tone: "pink" | "mint" | "yolk" }[] = [
  { limit: `1日のビルド ${FREE_PLAN.buildsPerDay}回`, trait: "1日に100回しか成長できない。だから20分に1回、大事に成長する。", icon: "sprout", tone: "mint" },
  { limit: `環境変数 ${FREE_PLAN.envBytes}バイト`, trait: "秘密は4KBぶんしか持てない。それ以上の記憶はぜんぶGitに書く。", icon: "heart", tone: "pink" },
  { limit: `1リクエスト ${FREE_PLAN.requestTimeoutSec}秒`, trait: "電話は60秒で切れる。だから話したいことは先に言う。", icon: "phone", tone: "yolk" },
  { limit: `メモリ ${FREE_PLAN.memoryMiB}MiB`, trait: "頭の中はちょっと狭い。日記は300回ぶんで古いのから忘れる。", icon: "moon", tone: "pink" },
  { limit: `CPU 月${FREE_PLAN.cpuHoursPerMonth}時間`, trait: "考えごとはGitHub Actionsの中でする。ここでは寝てるだけ。", icon: "star", tone: "yolk" },
  { limit: `プロジェクト ${FREE_PLAN.projects}個`, trait: "いつか分身を200人つくれる。まだ1人。", icon: "ribbon", tone: "mint" },
];

const TONE_CLASS: Record<(typeof TRAITS)[number]["tone"], string> = {
  pink: "bg-pink-pale text-pink-deep",
  mint: "bg-mint-pale text-mint",
  yolk: "bg-yolk-pale text-yolk",
};

/** 無料プランの制限を「体質」として並べる。数字の表ではなく性格として読ませる。 */
export function Traits() {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {TRAITS.map((t) => (
        <li key={t.limit} className="card card-lift px-5 py-4 flex gap-3 items-start">
          <span className={`grid place-items-center w-10 h-10 rounded-2xl flex-none rotate-[-6deg] ${TONE_CLASS[t.tone]}`}>
            <Icon name={t.icon} size={18} />
          </span>
          <div>
            <p className="log-line">{t.limit}</p>
            <p className="mt-1">{t.trait}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
