"use server";

import { inngest } from "@/inngest/client";
import { geminiChannel } from "@/inngest/channels/gemini";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type GeminiToken = Realtime.Token<typeof geminiChannel, ["status"]>;

export async function fetchGeminiRealtimeToken(): Promise<GeminiToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: geminiChannel(),
    topics: ["status"],
  });

  return token;
}
