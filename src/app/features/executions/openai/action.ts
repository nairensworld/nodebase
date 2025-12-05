"use server";

import { inngest } from "@/inngest/client";
import { openaiChannel } from "@/inngest/channels/openai";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type OpenAiToken = Realtime.Token<typeof openaiChannel, ["status"]>;

export async function fetchOpenaiRealtimeToken(): Promise<OpenAiToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: openaiChannel(),
    topics: ["status"],
  });

  return token;
}
