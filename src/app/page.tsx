"use client";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "./features/logout-button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        toast.success("Job Queued");
      },
    })
  );

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-y-6">
      <div>protected page</div>
      <div>{JSON.stringify(data, null, 2)}</div>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        Create Workflow
      </Button>
      <LogoutButton />
    </div>
  );
};

export default Page;
