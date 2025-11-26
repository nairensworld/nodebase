import type { NodeExecuter } from "@/app/features/executions/types";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecuter: NodeExecuter<ManualTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // TODO: pubish loading state for manual trigger

  const result = await step.run("manual-trigger", async () => context);

  // TODO: pubish success state for manual trigger

  return result;
};
