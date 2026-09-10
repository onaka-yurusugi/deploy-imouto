import Anthropic from "@anthropic-ai/sdk";

export const MODEL_ID = "claude-opus-5";

let client: Anthropic | null = null;

export function anthropicClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}
