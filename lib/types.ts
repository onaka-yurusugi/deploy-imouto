export const MOODS = ["genki", "nikoniko", "nemui", "sabishii", "wakuwaku", "sune"] as const;
export type Mood = (typeof MOODS)[number];

export const CALL_NAMES = ["お兄ちゃん", "お姉ちゃん"] as const;
export type CallName = (typeof CALL_NAMES)[number];

export type Letter = {
  id: string;
  at: string;
  from: string;
  callName: CallName;
  body: string;
  reply: string | null;
  repliedGeneration: number | null;
};

export type DiaryEntry = {
  generation: number;
  at: string;
  text: string;
  mood: Mood;
  lettersRead: number;
};

export type ImoutoState = {
  name: string;
  bornAt: string | null;
  generation: number;
  mood: Mood;
  diary: DiaryEntry[];
  letters: Letter[];
};

/** お手紙ポスト（mailbox ブランチ）に置かれる未読の手紙 */
export type MailboxLetter = Pick<Letter, "id" | "at" | "from" | "callName" | "body">;

export function isMood(value: string): value is Mood {
  return (MOODS as readonly string[]).includes(value);
}

export function isCallName(value: string): value is CallName {
  return (CALL_NAMES as readonly string[]).includes(value);
}

/** 立ち絵と話し方のモード。きぶんから決まる。 */
export const MODES = ["tsundere", "deredere", "coodere"] as const;
export type ImoutoMode = (typeof MODES)[number];

export function isMode(value: string): value is ImoutoMode {
  return (MODES as readonly string[]).includes(value);
}

export function moodToMode(mood: Mood): ImoutoMode {
  // 基本はツンデレ。手紙などでにこにこのときだけデレる。眠いときだけクール。
  switch (mood) {
    case "nikoniko":
      return "deredere";
    case "nemui":
      return "coodere";
    case "genki":
    case "wakuwaku":
    case "sune":
    case "sabishii":
      return "tsundere";
  }
}
