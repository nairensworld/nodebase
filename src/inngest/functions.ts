import prisma from "@/lib/db";
import { inngest } from "./client";
import { topologicalSort } from "./utils";
import { NonRetriableError } from "inngest";
import { NodeType } from "@/generated/prisma";
import { InngestFunctionConsts } from "./inngest-function-consts";
import { getExecuter } from "@/app/features/executions/lib/executor-registery";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: InngestFunctionConsts.EXECUTE_WORKFLOW_NAME },

  async ({ event, step }) => {
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
      });
    }

    return {
      workflowId,
      result: context,
    };
  }
);
