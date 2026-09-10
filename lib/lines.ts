import type { Mood } from "./types";
import type { TimeOfDay } from "./time";

/** 時間帯ごとの定型セリフ。LLMを使わずクライアントで出し分ける。 */
export const GREETINGS: Record<TimeOfDay, readonly string[]> = {
  morning: [
    "おはよ！今日もデプロイされちゃった〜",
    "朝からビルド通ってごきげん！",
    "ねぼけてる…けどちゃんと起きてるよ？",
  ],
  day: [
    "おかえり！お昼ごはん食べた？",
    "いま何回目のデプロイだと思う？すごいでしょ",
    "ひまだったからログ眺めてた。",
  ],
  evening: [
    "夕方だ〜。今日はいっぱい成長したよ",
    "ただいま…じゃなくて、おかえり！",
    "そろそろお手紙、来てないかな",
  ],
  night: [
    "…まだ起きてたの？わたしもだけど",
    "夜中のデプロイって、ちょっと秘密っぽくて好き",
    "小さい声で話そ。おやすみモードだから",
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
