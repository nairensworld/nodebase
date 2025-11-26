import { NodeExecuter } from "../types";
import { NodeType } from "@/generated/prisma";
import { manualTriggerExecuter } from "../../triggers/components/manual-trigger/executer";
import { httpRequestExecuter } from "../http-request/executer";

export const executorRegistry: Record<NodeType, NodeExecuter> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecuter,
  [NodeType.INITIAL]: manualTriggerExecuter,
  [NodeType.HTTP_REQUEST]: httpRequestExecuter,
};

export const getExecuter = (type: NodeType): NodeExecuter => {
  const executer = executorRegistry[type];
  if (!executer) {
    throw new Error(`No executer found for node type: ${type}`);
  }
  return executer;
};
