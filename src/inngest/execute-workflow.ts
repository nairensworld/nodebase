import { inngest } from "./client"

const inngestExecuteWorkflowFunction = {
    { id: "execute-workflow" },
{ event: "workflows/execute.workflow" },
{
    executeWorkflow: async ({ event, step }) => {
        await step.sleep("test", "5s")
    }
}
}