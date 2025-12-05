import { channel, topic } from "@inngest/realtime";
import { InngestConsts } from "../inngest-function-consts";
import { channelStatusOptions } from "@/app/features/executions/types";

export const geminiChannel = channel(InngestConsts.GEMINI_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: channelStatusOptions;
  }>()
);
