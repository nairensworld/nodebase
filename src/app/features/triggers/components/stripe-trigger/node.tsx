"use client";

import { memo, useState } from "react";
import { NodeProps } from "@xyflow/react";
import { StripeTriggerDialog } from "./dialog";
import { BaseTriggerNode } from "../base-trigger-node";
import { InngestConsts } from "@/inngest/inngest-function-consts";
import { useNodeStatus } from "@/app/features/executions/hooks/use-node-status";
import { fetchStripeTriggerChannelRealtimeToken } from "./action";

export const StripeTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOpenSettings = () => setDialogOpen(true);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: InngestConsts.STRIPE_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchStripeTriggerChannelRealtimeToken,
  });
  return (
    <>
      <StripeTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <BaseTriggerNode
        {...props}
        icon="/logos/stripe.svg"
        name="Stripe"
        description="When Stripe event is captured"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});
