import type {
  channelStatusOptions,
  NodeExecuter,
} from "@/app/features/executions/types";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger-channel";

type GoogleFormTriggerData = Record<string, unknown>;

export const googleFormTriggerExecuter: NodeExecuter<
  GoogleFormTriggerData
> = async ({ data, nodeId, context, step, publish }) => {
  await publish(buildChannelWithStatus(nodeId, "loading"));

  const result = await step.run("google-form-trigger", async () => context);

  await publish(buildChannelWithStatus(nodeId, "success"));

  return result;
};

function buildChannelWithStatus(
  nodeId: string,
  statusString: channelStatusOptions
) {
  return googleFormTriggerChannel().status({
    nodeId,
    status: statusString,
  });
}
