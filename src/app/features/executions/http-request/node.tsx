"use client";

import { BaseExecutionNode } from "@/components/base-execution-node";
import { Node, NodeProps } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo } from "react";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body: string;
  [key: string]: unknown;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HTTPRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const nodeData = props.data as HttpRequestNodeData;
  const description = nodeData?.endpoint
    ? `${nodeData.method || "GET"} : ${nodeData.endpoint}`
    : "Not configured";

  return (
    <>
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={GlobeIcon}
        name="HTTP Request"
        description={description}
        onSettings={() => {}}
        onDoubleClick={() => {}}
      />
    </>
  );
});

HTTPRequestNode.displayName = "HTTPRequestNode";
