import { sendWorkflowExecution } from "@/inngest/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (workflowId) {
      const body = await request.json();
      const formData = mapFromData(body);

      await sendWorkflowExecution({
        workflowId,
        initialData: {
          googleForm: formData,
        },
      });
    } else {
      returnFailureMessage("Missing required query parameter: workflowId", 400);
    }

    // Trigger an Inngest job
  } catch (error) {
    console.error("Failed  to process Google Form submission");
    returnFailureMessage("Failed  to process Google Form submission", 500);
  }
}

function verifyExistsAndGetWorkflowId(request: NextRequest) {
  const url = new URL(request.url);
  const workflowId = url.searchParams.get("workflowId");
  if (!workflowId) {
    returnFailureMessage("Missing required query parameter: workflowId", 400);
  }

  return workflowId;
}

function mapFromData(body: any) {
  return {
    formId: body.formId,
    formTitle: body.formTitle,
    responseId: body.responseId,
    timestamp: body.timestamp,
    respondentEmail: body.respondentEmail,
    responses: body.responses,
    raw: body,
  };
}

function returnFailureMessage(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    { status: status }
  );
}
