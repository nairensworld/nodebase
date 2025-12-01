"use server";

import { inngest } from "@/inngest/client";
import { httpRequestChannel } from "@/inngest/channels/http-request-channel";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type HttpRequestToken = Realtime.Token<
  typeof httpRequestChannel,
  ["status"]
>;

export async function fetchHttpRequestRealtimeToken(): Promise<HttpRequestToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: httpRequestChannel(),
    topics: ["status"],
  });

  return token;
}
