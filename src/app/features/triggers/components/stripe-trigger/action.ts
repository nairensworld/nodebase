"use server";

import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger-channel";

export type StripeTriggerChannelToken = Realtime.Token<
  typeof stripeTriggerChannel,
  ["status"]
>;

export async function fetchStripeTriggerChannelRealtimeToken(): Promise<StripeTriggerChannelToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: stripeTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
