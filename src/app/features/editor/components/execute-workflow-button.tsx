import { Button } from "@/components/ui/button";
import { FlaskConicalIcon } from "lucide-react";
import { useExecuteWorkflow } from "../../workflows/hooks/use-workflows";


export const ExecuteWorkflowButton = ({ workflowId }: { workflowId: string }) => {
    const executeWorkflow = useExecuteWorkflow()
    const handleExecuteWorkflow = () => executeWorkflow.mutate({ id: workflowId })

    return (
        <Button size="lg" onClick={handleExecuteWorkflow} disabled={executeWorkflow.isPending}>
            <FlaskConicalIcon className="size-4" />
            Execute workflow
        </Button>
    );
}