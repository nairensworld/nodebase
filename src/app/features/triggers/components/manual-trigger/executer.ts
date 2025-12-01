import type { NodeExecuter } from "@/app/features/executions/types";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger-channel";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecuter: NodeExecuter<ManualTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(buildChannelWithStatus(nodeId, "loading"));

  const result = await step.run("manual-trigger", async () => context);

  await publish(buildChannelWithStatus(nodeId, "success"));

  return result;
};

function buildChannelWithStatus(
  nodeId: string,
  statusString: "loading" | "success" | "error"
) {
  return manualTriggerChannel().status({
    nodeId,
    status: statusString,
  });
}
