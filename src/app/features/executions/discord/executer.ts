import ky from "ky";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import { discordChannel } from "@/inngest/channels/discord";
import type { channelStatusOptions, NodeExecuter } from "@/app/features/executions/types";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const discordExecuter: NodeExecuter<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(message("loading"));

  if (!data.content) {
    await publish(message("error"));
    throw new NonRetriableError("Discord node: Content is required");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  try {
    const result = await step.run("discord-webhook", async () => {
      if (!data.variableName) {
        await publish(message("error"));
        throw new NonRetriableError("Discord node: Variable name not configured");
      }

      if (!data.webhookUrl) {
        await publish(message("error"));
        throw new NonRetriableError("Discord node: Webhook URL not configured");
      }

      await ky.post(data.webhookUrl, {
        json: { content: content.slice(0, 2000), username },
      });

      return {
        ...context,
        [data.variableName]: { messageContent: content.slice(0, 2000) },
      };
    });

    await publish(message("success"));

    return result;
  } catch (error) {
    await publish(message("error"));
    throw error;
  }

  function message(status: channelStatusOptions) {
    return discordChannel().status({ nodeId, status });
  }
};
