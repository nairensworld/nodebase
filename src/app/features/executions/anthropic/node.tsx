"use client";

import { memo, useState } from "react";
import { fetchAnthropicRealtimeToken } from "./action";
import { useNodeStatus } from "../hooks/use-node-status";
import { AnthropicDialog, AnthropicFormValues } from "./dialog";
import { InngestConsts } from "@/inngest/inngest-function-consts";
import { BaseExecutionNode } from "@/components/base-execution-node";
import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";

type AnthropicNodeData = {
  variableName?: string;
  credentialId?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: InngestConsts.ANTHROPIC_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchAnthropicRealtimeToken,
  });

  const handleSettings = () => setDialogOpen(true);

  const handleSubmit = (values: AnthropicFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      })
    );
  };

  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `openai : ${nodeData.userPrompt.slice(0, 10)}...`
    : "Not configured";

  return (
    <>
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/anthropic.svg"
        name="Anthropic"
        status={nodeStatus}
        description={description}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      />
    </>
  );
});

AnthropicNode.displayName = "AnthropicNode";
