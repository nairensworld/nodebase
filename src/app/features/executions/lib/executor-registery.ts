import { NodeExecuter } from "../types";
import { NodeType } from "@/generated/prisma";
import { geminiExecuter } from "../gemini/executer";
import { httpRequestExecuter } from "../http-request/executer";
import { manualTriggerExecuter } from "../../triggers/components/manual-trigger/executer";
import { stripeTriggerExecuter } from "../../triggers/components/stripe-trigger/executer";
import { googleFormTriggerExecuter } from "../../triggers/components/google-form-trigger/executer";
import { openaiExecuter } from "../openai/executer";
import { anthropicExecuter } from "../anthropic/executer";

export const executorRegistry: Record<NodeType, NodeExecuter> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecuter,
  [NodeType.INITIAL]: manualTriggerExecuter,
  [NodeType.HTTP_REQUEST]: httpRequestExecuter,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecuter,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecuter,
  [NodeType.GEMINI]: geminiExecuter,
  [NodeType.OPENAI]: openaiExecuter,
  [NodeType.ANTHROPIC]: anthropicExecuter,
};

export const getExecuter = (type: NodeType): NodeExecuter => {
  const executer = executorRegistry[type];
  if (!executer) {
    throw new Error(`No executer found for node type: ${type}`);
  }
  return executer;
};
