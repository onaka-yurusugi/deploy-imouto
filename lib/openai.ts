import OpenAI from "openai";

export const MODEL_ID = "gpt-5.4-mini";

let client: OpenAI | null = null;

export function openaiClient(): OpenAI {
  if (!client) client = new OpenAI();
  return client;
}
