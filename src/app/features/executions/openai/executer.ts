import prisma from "@/lib/db";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { createOpenAI } from "@ai-sdk/openai";
import { openaiChannel } from "@/inngest/channels/openai";
import type { channelStatusOptions, NodeExecuter } from "@/app/features/executions/types";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type OpenAiData = {
  variableName?: string;
  credentialId?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const openaiExecuter: NodeExecuter<OpenAiData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(message("loading"));

  if (!data.variableName) {
    await publish(message("error"));
    throw new NonRetriableError("OpenAi node: Variable name not configured");
  }
  if (!data.userPrompt) {
    await publish(message("error"));
    throw new NonRetriableError("OpenAI node: User Prompt not configured");
  }
  if (!data.credentialId) {
    await publish(message("error"));
    throw new NonRetriableError("OpenAI node: Credential not configured");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({ where: { id: data.credentialId, userId } });
  });
  if (!credential) {
    await publish(message("error"));
    throw new NonRetriableError("OpenAI node: Credential not found");
  }

  const openai = createOpenAI({ apiKey: credential.value });

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai("gpt-4.1-mini-2025-04-14"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });
    const text = steps[0]?.content[0]?.type === "text" ? steps[0]?.content[0]?.text : "";
    await publish(message("success"));

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
    await publish(message("error"));
    throw error;
  }

  function message(status: channelStatusOptions) {
    return openaiChannel().status({ nodeId, status });
  }
};
