import { NodeType } from "@/generated/prisma";
import type { NodeTypes } from "@xyflow/react";
import { HTTPRequestNode } from "../http-request/node";
import { InitialNode } from "@/components/initial-node";
import { ManualTriggerNode } from "../../triggers/components/manual-trigger/node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQUEST]: HTTPRequestNode,
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;
