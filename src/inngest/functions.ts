import prisma from "@/lib/db";
import { inngest } from "./client";
import { topologicalSort } from "./utils";
import { NonRetriableError } from "inngest";
import { NodeType } from "@/generated/prisma";
import { slackChannel } from "./channels/slack";
import { geminiChannel } from "./channels/gemini";
import { openaiChannel } from "./channels/openai";
import { discordChannel } from "./channels/discord";
import { anthropicChannel } from "./channels/anthropic";
import { InngestConsts } from "./inngest-function-consts";
import { httpRequestChannel } from "./channels/http-request-channel";
import { manualTriggerChannel } from "./channels/manual-trigger-channel";
import { stripeTriggerChannel } from "./channels/stripe-trigger-channel";
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
      stripeTriggerChannel(),
      geminiChannel(),
      openaiChannel(),
      anthropicChannel(),
      discordChannel(),
      slackChannel(),
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

    const userId = await step.run("find-workflow-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: {
          userId: true,
        },
      });
      return workflow.userId;
    });

    // Initialize the context with any initial data from the trigger
    let context = event.data.initialData || {};

    // Execute each node
    for (const node of sortedNodes) {
      const executer = getExecuter(node.type as NodeType);
      context = await executer({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        userId,
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
