import { channel, topic } from "@inngest/realtime";
import { InngestConsts } from "../inngest-function-consts";
import { channelStatusOptions } from "@/app/features/executions/types";

export const stripeTriggerChannel = channel(
  InngestConsts.STRIPE_TRIGGER_CHANNEL_NAME
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: channelStatusOptions;
  }>()
);
