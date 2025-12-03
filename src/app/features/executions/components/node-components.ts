import { NodeType } from "@/generated/prisma";
import type { NodeTypes } from "@xyflow/react";
import { HTTPRequestNode } from "../http-request/node";
import { InitialNode } from "@/components/initial-node";
import { ManualTriggerNode } from "../../triggers/components/manual-trigger/node";
import { GoogleFormTriggerNode } from "../../triggers/components/google-form-trigger/node";
import { StripeTriggerNode } from "../../triggers/components/stripe-trigger/node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQUEST]: HTTPRequestNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;
