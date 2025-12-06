import prisma from "@/lib/db";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { createAnthropic } from "@ai-sdk/anthropic";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import type { channelStatusOptions, NodeExecuter } from "@/app/features/executions/types";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type AnthropicData = {
  variableName?: string;
  credentialId?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const anthropicExecuter: NodeExecuter<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(message("loading"));

  if (!data.variableName) {
    await publish(message("error"));
    throw new NonRetriableError("Anthropic node: Variable name not configured");
  }
  if (!data.userPrompt) {
    await publish(message("error"));
    throw new NonRetriableError("Anthropic node: User Prompt not configured");
  }
  if (!data.credentialId) {
    await publish(message("error"));
    throw new NonRetriableError("Anthropic node: Credential not configured");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
      },
    });
  });
  if (!credential) {
    throw new NonRetriableError("Anthropic node: Credential not found");
  }

  const anthropic = createAnthropic({
    apiKey: credential.value,
  });

  try {
    const { steps } = await step.ai.wrap("anthropic-generate-text", generateText, {
      model: anthropic("claude-3-5-haiku-latest"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });
    const text = steps[0].content[0].type === "text" ? steps[0].content[0].text : "";
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
    return anthropicChannel().status({ nodeId, status });
  }
};
