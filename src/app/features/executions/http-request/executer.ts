import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import type { channelStatusOptions, NodeExecuter } from "@/app/features/executions/types";
import { httpRequestChannel } from "@/inngest/channels/http-request-channel";

function createSafeJsonString(): Handlebars.HelperDelegate {
  return (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
  };
}
Handlebars.registerHelper("json", createSafeJsonString());

type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecuter: NodeExecuter<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  try {
    await publish(message("loading"));

    const result = await step.run("http-request", async () => {
      if (!data.endpoint) {
        await publish(message("error"));
        throw new NonRetriableError("HTTP Request node: Endpoint not configured");
      }

      if (!data.variableName) {
        await publish(message("error"));
        throw new NonRetriableError("HTTP Request node: Variable name not configured");
      }

      if (!data.method) {
        await publish(message("error"));
        throw new NonRetriableError("HTTP Request node: Method not configured");
      }

      const endpoint = Handlebars.compile(data.endpoint)(context);
      const method = data.method;
      const options: KyOptions = { method };

      if (["POST", "PUT", "PATCH"].includes(method)) {
        const resolvedBody = Handlebars.compile(data.body || "{}")(context);
        JSON.parse(resolvedBody);
        options.body = resolvedBody;
        options.headers = {
          "content-type": "application/json",
        };
      }

      const response = await ky(endpoint, options);
      const contentType = response.headers.get("content-type");
      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };

      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    });
    await publish(message("success"));

    return result;
  } catch (error) {
    await publish(message("error"));
    throw error;
  }

  function message(status: channelStatusOptions) {
    return httpRequestChannel().status({ nodeId, status });
  }
};
