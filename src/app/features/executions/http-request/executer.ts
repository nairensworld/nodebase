import type {
  NodeExecuter,
  WorkflowContext,
} from "@/app/features/executions/types";

import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

function createSafeJsonString(): Handlebars.HelperDelegate {
  return (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
  };
}
Handlebars.registerHelper("json", createSafeJsonString());

type HttpRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecuter: NodeExecuter<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // TODO: pubish loading state for http request

  if (!data.endpoint) {
    // TODO: Publish error state for http request
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }

  if (!data.variableName) {
    // TODO: Publish error state for http request
    throw new NonRetriableError(
      "HTTP Request node: Variable name not configured"
    );
  }

  if (!data.method) {
    // TODO: Publish error state for http request
    throw new NonRetriableError("HTTP Request node: Method not configured");
  }

  const result = await step.run(
    "http-request",
    executeHttpRequest(data, context)
  );
  // TODO: pubish success state for http request

  return result;
};

function executeHttpRequest(
  data: HttpRequestData,
  context: WorkflowContext
): () => Promise<
  | { [x: string]: unknown }
  | { httpResponse: { status: number; statusText: string; data: unknown } }
> {
  return async () => {
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
  };
}
