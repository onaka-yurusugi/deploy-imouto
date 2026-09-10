import state from "@/data/state.json";
import type { ImoutoState } from "./types";

/** ビルド時に焼き込まれる妹の状態。デプロイされるたびに更新される。 */
export const imoutoState: ImoutoState = state as ImoutoState;

/** 無料プランの制限値（公式ドキュメント「プラン」より） */
export const FREE_PLAN = {
  buildsPerDay: 100,
  projects: 200,
  envBytes: 4096,
  requestTimeoutSec: 60,
  memoryMiB: 512,
  cpuHoursPerMonth: 4,
  cdnGbPerMonth: 100,
  requestsPerMonth: 1_000_000,
  peakRequestsPerSec: 10,
  deploySizeMb: 100,
} as const;

/** 60秒の壁より少し手前で切る（ネットワーク遅延ぶんの余裕） */
export const CALL_LIMIT_SEC = 60;
export const CALL_SERVER_CUTOFF_MS = 50_000;

export const LETTER_LIMITS = { fromMax: 20, bodyMax: 300 } as const;

/** 1回の tick で読む手紙の上限（LLMコストと日記の長さを抑える） */
export const LETTERS_PER_TICK = 10;
export const DIARY_KEEP = 300;
export const LETTERS_KEEP = 100;
