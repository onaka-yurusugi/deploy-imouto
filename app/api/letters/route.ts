import { NextResponse } from "next/server";
import { z } from "zod";
import { CALL_NAMES, type MailboxLetter } from "@/lib/types";
import { LETTER_LIMITS } from "@/lib/state";
import { mailboxConfig, postToMailbox } from "@/lib/github";
import { clientKey, consume, envInt } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";



const LetterInput = z.object({
  from: z.string().trim().min(1).max(LETTER_LIMITS.fromMax),
  callName: z.enum(CALL_NAMES),
  body: z.string().trim().min(1).max(LETTER_LIMITS.bodyMax),
});

const HOUR_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  const config = mailboxConfig();
  if (!config) {
    return NextResponse.json({ error: "ポストがまだ設置されていません（GITHUB_TOKEN 未設定）" }, { status: 503 });
  }
  if (!consume(`letter:${clientKey(req)}`, envInt("LETTER_HOURLY_LIMIT", 5), HOUR_MS)) {
    return NextResponse.json({ error: "お手紙は1時間に数通まで。すこし待ってね" }, { status: 429 });
  }
  const parsed = LetterInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "名前と本文を確認してね" }, { status: 400 });
  }
  const letter: MailboxLetter = {
    id: `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`,
    at: new Date().toISOString(),
    ...parsed.data,
  };
  try {
    await postToMailbox(letter, config);
  } catch (error) {
    console.error("postToMailbox failed", error);
    return NextResponse.json({ error: "ポストが詰まってる…また後で入れてみて" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, id: letter.id });
}
