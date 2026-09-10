import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { anthropicClient, MODEL_ID } from "@/lib/anthropic";
import { PERSONA_SYSTEM, stateContext } from "@/lib/persona";
import { imoutoState, CALL_LIMIT_SEC, CALL_SERVER_CUTOFF_MS } from "@/lib/state";
import { CALL_NAMES } from "@/lib/types";
import { clientKey, consume, envInt } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const CallInput = z.object({
  callName: z.enum(CALL_NAMES),
  elapsedSec: z.number().min(0).max(CALL_LIMIT_SEC),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(400) }))
    .min(1)
    .max(30),
});

const DAY_MS = 24 * 60 * 60 * 1000;
const encoder = new TextEncoder();

function sse(event: string, data: string): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * 60秒通話。1リクエスト60秒の壁があるので、サーバー側でも50秒で強制的に切る。
 * ストリーミングで返すので、切れた瞬間まで妹は喋り続ける。
 */
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("電話線がつながっていません（ANTHROPIC_API_KEY 未設定）", { status: 503 });
  }
  const ip = clientKey(req);
  if (!consume("call:global", envInt("CALL_DAILY_LIMIT", 200), DAY_MS)) {
    return new Response("今日はもう電話代がないの…また明日かけてね", { status: 429 });
  }
  if (!consume(`call:${ip}`, envInt("CALL_PER_IP_DAILY_LIMIT", 20), DAY_MS)) {
    return new Response("今日はいっぱい話したね。また明日！", { status: 429 });
  }
  const parsed = CallInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return new Response("聞き取れなかった…もう一回言って？", { status: 400 });
  }
  const { callName, elapsedSec, messages } = parsed.data;
  const remaining = Math.max(0, CALL_LIMIT_SEC - elapsedSec);

  const controller = new AbortController();
  const cutoff = setTimeout(() => controller.abort(), CALL_SERVER_CUTOFF_MS);

  const history: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }));
  const turnNote = `## この通話について
- 相手の呼び方: ${callName}
- 電話は${CALL_LIMIT_SEC}秒で自動的に切れる。残り約${remaining}秒。
- 残りが15秒を切っていたら、名残惜しそうに短く切り上げる。
- 返事は1〜3文。電話なので声に出して読める長さで。`;

  const stream = anthropicClient().beta.messages.stream(
    {
      model: MODEL_ID,
      max_tokens: 300,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [
        { type: "text", text: PERSONA_SYSTEM, cache_control: { type: "ephemeral" } },
        { type: "text", text: `${stateContext(imoutoState, new Date())}\n\n${turnNote}` },
      ],
      messages: history,
    },
    { signal: controller.signal },
  );

  const body = new ReadableStream<Uint8Array>({
    async start(sink) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            sink.enqueue(sse("text", event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        sink.enqueue(sse("done", final.stop_reason ?? "end_turn"));
      } catch (error) {
        if (controller.signal.aborted) {
          sink.enqueue(sse("cut", "ぷつっ"));
        } else {
          console.error("call stream failed", error);
          sink.enqueue(sse("error", "…もしもし？電波わるいかも"));
        }
      } finally {
        clearTimeout(cutoff);
        sink.close();
      }
    },
    cancel() {
      controller.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
