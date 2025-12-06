import ky from "ky";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import { slackChannel } from "@/inngest/channels/slack";
import type { channelStatusOptions, NodeExecuter } from "@/app/features/executions/types";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const slackExecuter: NodeExecuter<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(message("loading"));

  if (!data.content) {
    await publish(message("error"));
    throw new NonRetriableError("Slack node: Content is required");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);

  try {
    const result = await step.run("slack-webhook", async () => {
      if (!data.variableName) {
        await publish(message("error"));
        throw new NonRetriableError("Slack node: Variable name not configured");
      }

      if (!data.webhookUrl) {
        await publish(message("error"));
        throw new NonRetriableError("Slack node: Webhook URL not configured");
      }

      await ky.post(data.webhookUrl, { json: { content } });

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
    return slackChannel().status({ nodeId, status });
  }
};
