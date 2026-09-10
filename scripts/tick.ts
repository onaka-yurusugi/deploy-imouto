/**
 * 妹を1回ぶん成長させる。GitHub Actions から定期実行される。
 *
 * 1. mailbox ブランチから未読の手紙を拾う
 * 2. Claude に日記1本と手紙への返事を書かせる
 * 3. data/state.json を更新して main に push → デプロイナウが自動デプロイ
 * 4. 読み終えた手紙を mailbox から片付ける（失敗しても次回に持ち越す）
 *
 * LLM呼び出しはここ（Actions側）で完結するので、デプロイナウのCPU時間は消費しない。
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropicClient, MODEL_ID } from "../lib/anthropic";
import { PERSONA_SYSTEM, stateContext } from "../lib/persona";
import { DIARY_KEEP, LETTERS_KEEP, LETTERS_PER_TICK } from "../lib/state";
import { MOODS, type ImoutoState, type Letter, type MailboxLetter } from "../lib/types";
import { MAILBOX_DIR } from "../lib/github";
import { timeOfDay } from "../lib/time";

const STATE_PATH = "data/state.json";
const MAILBOX_BRANCH = process.env.MAILBOX_BRANCH ?? "mailbox";
const DRY_RUN = process.env.DRY_RUN === "1";

function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function readMailbox(): MailboxLetter[] {
  try {
    git("fetch", "origin", MAILBOX_BRANCH);
  } catch {
    console.log(`mailbox ブランチ "${MAILBOX_BRANCH}" が無いので手紙なし`);
    return [];
  }
  const ref = `origin/${MAILBOX_BRANCH}`;
  const files = git("ls-tree", "-r", "--name-only", ref, MAILBOX_DIR).split("\n").filter((f) => f.endsWith(".json"));
  const letters: MailboxLetter[] = [];
  for (const file of files) {
    try {
      const raw = JSON.parse(git("show", `${ref}:${file}`));
      const parsed = MailboxSchema.safeParse(raw);
      if (parsed.success) letters.push(parsed.data);
      else console.warn(`壊れた手紙をスキップ: ${file}`);
    } catch (error) {
      console.warn(`読めない手紙をスキップ: ${file}`, error);
    }
  }
  return letters.sort((a, b) => a.at.localeCompare(b.at));
}

const MailboxSchema = z.object({
  id: z.string().min(1),
  at: z.string().min(1),
  from: z.string().min(1).max(40),
  callName: z.enum(["お兄ちゃん", "お姉ちゃん"]),
  body: z.string().min(1).max(600),
});

const TickOutput = z.object({
  diary: z.string().describe("今回のデプロイの日記。80〜140文字。"),
  mood: z.enum(MOODS).describe("日記を書き終えたあとのきぶん"),
  replies: z.array(z.object({ id: z.string(), reply: z.string().describe("60〜150文字の返事") })),
});

async function compose(state: ImoutoState, fresh: MailboxLetter[], now: Date): Promise<z.infer<typeof TickOutput>> {
  const lettersText = fresh.length
    ? fresh.map((l) => `- id=${l.id} / ${l.from}（${l.callName}と呼ぶ）: ${l.body}`).join("\n")
    : "（今回は届いていない）";
  const prompt = `いまから第${state.generation + 1}回目のデプロイが始まります。時間帯は「${timeOfDay(now)}」。

## 今回届いた手紙
${lettersText}

## やること
1. 今回のデプロイの日記を1本書く。手紙が来ていればその話題に触れる。来ていなければ日常のこと。
2. 手紙1通ごとに返事を書く（idを必ず対応させる）。
3. 日記を書き終えたあとのきぶんを選ぶ。`;

  const response = await anthropicClient().messages.parse({
    model: MODEL_ID,
    max_tokens: 4000,
    output_config: { effort: "medium", format: zodOutputFormat(TickOutput) },
    system: [
      { type: "text", text: PERSONA_SYSTEM, cache_control: { type: "ephemeral" } },
      { type: "text", text: stateContext(state, now) },
    ],
    messages: [{ role: "user", content: prompt }],
  });
  if (!response.parsed_output) {
    throw new Error(`日記が書けなかった: stop_reason=${response.stop_reason}`);
  }
  return response.parsed_output;
}

function cleanupMailbox(ids: string[]): void {
  if (ids.length === 0) return;
  try {
    git("fetch", "origin", MAILBOX_BRANCH);
    git("checkout", "-B", MAILBOX_BRANCH, `origin/${MAILBOX_BRANCH}`);
    git("rm", "-q", "--", ...ids.map((id) => `${MAILBOX_DIR}/${id}.json`));
    git("commit", "-q", "-m", `read: ${ids.length}通の手紙を読んだ`);
    git("push", "origin", MAILBOX_BRANCH);
    console.log(`mailbox を片付けた: ${ids.length}通`);
  } catch (error) {
    console.warn("mailbox の片付けに失敗（次回に持ち越し）", error);
  } finally {
    git("checkout", "-q", "main");
  }
}

async function main(): Promise<void> {
  const now = new Date();
  const state = JSON.parse(readFileSync(STATE_PATH, "utf8")) as ImoutoState;
  const known = new Set(state.letters.map((l) => l.id));
  const fresh = readMailbox().filter((l) => !known.has(l.id)).slice(0, LETTERS_PER_TICK);
  console.log(`第${state.generation + 1}回デプロイ / 未読の手紙 ${fresh.length}通`);

  const output = await compose(state, fresh, now);
  const generation = state.generation + 1;
  const replyById = new Map(output.replies.map((r) => [r.id, r.reply]));

  const newLetters: Letter[] = fresh.map((l) => ({
    ...l,
    reply: replyById.get(l.id) ?? null,
    repliedGeneration: replyById.has(l.id) ? generation : null,
  }));

  const next: ImoutoState = {
    ...state,
    bornAt: state.bornAt ?? now.toISOString(),
    generation,
    mood: output.mood,
    diary: [...state.diary, { generation, at: now.toISOString(), text: output.diary, mood: output.mood, lettersRead: fresh.length }].slice(-DIARY_KEEP),
    letters: [...state.letters, ...newLetters].slice(-LETTERS_KEEP),
  };
  writeFileSync(STATE_PATH, JSON.stringify(next, null, 2) + "\n");
  console.log(`日記: ${output.diary}`);

  if (DRY_RUN) {
    console.log("DRY_RUN のため commit しない");
    return;
  }
  git("config", "user.name", "nau-tick");
  git("config", "user.email", "nau-tick@users.noreply.github.com");
  git("add", STATE_PATH);
  git("commit", "-q", "-m", `tick: 第${generation}回デプロイ（手紙${fresh.length}通）`);
  git("push", "origin", "HEAD:main");
  cleanupMailbox(fresh.map((l) => l.id));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
