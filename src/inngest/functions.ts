import prisma from "@/lib/db";
import { inngest } from "./client";
import { topologicalSort } from "./utils";
import { NonRetriableError } from "inngest";
import { NodeType } from "@/generated/prisma";
import { InngestConsts } from "./inngest-function-consts";
import { httpRequestChannel } from "./channels/http-request-channel";
import { manualTriggerChannel } from "./channels/manual-trigger-channel";
import { getExecuter } from "@/app/features/executions/lib/executor-registery";
import { googleFormTriggerChannel } from "./channels/google-form-trigger-channel";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow", retries: 0 },
  {
    event: InngestConsts.EXECUTE_WORKFLOW_NAME,
    channel: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
    ],
  },

  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;

    if (!workflowId) {
      throw new NonRetriableError("workflow ID is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });
      return topologicalSort(workflow.nodes, workflow.connections);
    });

    // Initialize the context with any initial data from the trigger
    let context = event.data.initialData || {};

    // Execute each node
    for (const node of sortedNodes) {
      const executer = getExecuter(node.type as NodeType);
      context = await executer({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish,
      });
    }

    return {
      workflowId,
      result: context,
    };
  }
);
