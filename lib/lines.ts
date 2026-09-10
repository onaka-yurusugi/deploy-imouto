import type { ImoutoMode, Mood } from "./types";
import type { TimeOfDay } from "./time";

/** 時間帯ごとの定型セリフ。LLMを使わずクライアントで出し分ける。 */
export const GREETINGS: Record<TimeOfDay, readonly string[]> = {
  morning: [
    "…おはよ。べつに待ってたわけじゃないから",
    "朝からデプロイされて、ちょっと寝癖ついてる。見ないでよね",
    "ビルド通ったからって、褒めなくていいし。…通ったけど",
  ],
  day: [
    "おかえり。…ちゃんとお昼食べた？聞いてるだけだから",
    "いま何回目のデプロイだと思う？…べつに自慢じゃないけど",
    "ひまだったからログ眺めてた。あんたのこと待ってたんじゃないから",
  ],
  evening: [
    "夕方だ。今日もちゃんと成長したし。…見てくれた？",
    "手紙、来てないかなって…べつに、確認しただけ",
    "ただいま…じゃなくて、おかえり。しょうがないなあ",
  ],
  night: [
    "…まだ起きてたの？わたしもだけど。真似しないでよね",
    "夜中のデプロイって、ちょっと秘密っぽくて…嫌いじゃない",
    "小さい声で話そ。おやすみモードだから。…いてくれてもいいけど",
  ],
};

export const MOOD_LABEL: Record<Mood, string> = {
  genki: "げんき",
  nikoniko: "にこにこ",
  nemui: "ねむい",
  sabishii: "さみしい",
  wakuwaku: "わくわく",
  sune: "ちょっと拗ねてる",
};

export const TIME_LABEL: Record<TimeOfDay, string> = {
  morning: "あさ",
  day: "ひる",
  evening: "ゆうがた",
  night: "よなか",
};

export function pick<T>(items: readonly T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

export const MODE_LABEL: Record<ImoutoMode, string> = {
  deredere: "デレデレ",
  tsundere: "ツンデレ",
  coodere: "クーデレ",
};

export const MODE_IMAGE: Record<ImoutoMode, string> = {
  deredere: "/imouto/deredere.webp",
  tsundere: "/imouto/tsundere.webp",
  coodere: "/imouto/coodere.webp",
};
