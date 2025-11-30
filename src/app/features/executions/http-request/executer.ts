import type {
  NodeExecuter,
  WorkflowContext,
} from "@/app/features/executions/types";
import ky, { type Options as KyOptions } from "ky";
import { NonRetriableError } from "inngest";

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
}) => {
  // TODO: pubish loading state for http request

  if (!data.endpoint) {
    // TODO: Publish error state for http request
    throw new NonRetriableError("HTTP Request node: no endpoint configured");
  }

  if (!data.variableName) {
    // TODO: Publish error state for http request
    throw new NonRetriableError("Variable name not configured");
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
    const endpoint = data.endpoint!;
    const method = data.method || "GET";

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.body = data.body;
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

    if (data.variableName) {
      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    }

    // Fallback to direct httpResponse if no variable name is set
    return {
      ...context,
      ...responsePayload,
    };
  };
}
