import type { NodeExecuter } from "@/app/features/executions/types";
import ky, { type Options as KyOptions } from "ky";
import { NonRetriableError } from "inngest";

type HttpRequestData = {
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

  const result = await step.run("http-request", async () => {
    const endpoint = data.endpoint!;
    const method = data.method || "GET";

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.body = data.body;
    }

    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      ...context,
      httpResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      },
    };
  });

  // TODO: pubish success state for http request

  return result;
};
