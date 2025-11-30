"use client";

import { memo, useState } from "react";
import { GlobeIcon } from "lucide-react";
import { HttpRequestFormValues, HttpRequestDialog } from "./dialog";
import { BaseExecutionNode } from "@/components/base-execution-node";
import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "DELETE";
  body: string;
  variableName?: string;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HTTPRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = "initial";
  const handleSettings = () => setDialogOpen(true);

  const handleSubmit = (values: HttpRequestFormValues) => {
    setNodes((nodes) =>
      nodes.map(
        (node) => {
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
        }
        // end of map/return new object
      )
    );
  };

  const nodeData = props.data;
  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"} : ${nodeData.endpoint}`
    : "Not configured";

  return (
    <>
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={GlobeIcon}
        name="HTTP Request"
        status={nodeStatus}
        description={description}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      />
    </>
  );
});

HTTPRequestNode.displayName = "HTTPRequestNode";
