import { SlackNode } from "../slack/node";
import { GeminiNode } from "../gemini/node";
import { OpenAiNode } from "../openai/node";
import { NodeType } from "@/generated/prisma";
import { DiscordNode } from "../discord/node";
import type { NodeTypes } from "@xyflow/react";
import { AnthropicNode } from "../anthropic/node";
import { HTTPRequestNode } from "../http-request/node";
import { InitialNode } from "@/components/initial-node";
import { ManualTriggerNode } from "../../triggers/components/manual-trigger/node";
import { StripeTriggerNode } from "../../triggers/components/stripe-trigger/node";
import { GoogleFormTriggerNode } from "../../triggers/components/google-form-trigger/node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQUEST]: HTTPRequestNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAiNode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.SLACK]: SlackNode,
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;
