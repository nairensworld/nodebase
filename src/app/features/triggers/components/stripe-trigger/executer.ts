import type { NodeExecuter } from "@/app/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger-channel";

type StripeTriggerData = Record<string, unknown>;

export const stripeTriggerExecuter: NodeExecuter<StripeTriggerData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(stripeTriggerChannel().status({ nodeId, status: "loading" }));

  const result = await step.run("stripe-trigger", async () => context);

  publish(stripeTriggerChannel().status({ nodeId, status: "success" }));

  return result;
};
