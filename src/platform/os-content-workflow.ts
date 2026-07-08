import { z } from "zod";

const WorkflowResultSchema = z.object({
  success: z.literal(true),
  contentItemId: z.string().uuid(),
  status: z.enum(["idea", "draft", "generated", "needs_review", "approved", "scheduled", "published", "failed"]),
  scheduledFor: z.string().nullable(),
  updatedAt: z.string(),
});

const WorkflowErrorSchema = z.object({
  success: z.literal(false).optional(),
  code: z.string(),
  status: z.string().optional(),
});

export type ContentTransitionInput =
  | { contentItemId: string; action: "approve" | "return_to_review" | "unschedule" }
  | { contentItemId: string; action: "schedule"; scheduledFor: string };

export type ContentUpdateInput = {
  contentItemId: string;
  topic: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  visualPrompt: string;
};

async function workflowRequest(path: string, input: unknown) {
  const response = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = WorkflowErrorSchema.safeParse(body);
    throw new Error(error.success ? error.data.code : `CONTENT_WORKFLOW_HTTP_${response.status}`);
  }

  const result = WorkflowResultSchema.safeParse(body);
  if (!result.success) {
    const businessError = WorkflowErrorSchema.safeParse(body);
    throw new Error(businessError.success ? businessError.data.code : "INVALID_CONTENT_WORKFLOW_RESPONSE");
  }
  return result.data;
}

export function transitionContent(input: ContentTransitionInput) {
  return workflowRequest("/api/os-content-transition", input);
}

export function updateContent(input: ContentUpdateInput) {
  return workflowRequest("/api/os-content-update", input);
}

export function contentWorkflowErrorMessage(code: string): string {
  if (code === "APPROVAL_REQUIRED") return "Approve this content item before scheduling it.";
  if (code === "INVALID_SCHEDULE_TIME") return "Choose a future Dubai date and time.";
  if (code === "SCHEDULE_TOO_FAR") return "The schedule time must be within 366 days.";
  if (code === "INVALID_TRANSITION") return "This content status cannot perform the requested transition.";
  if (code === "PUBLISHED_CONTENT_IMMUTABLE") return "Published content is immutable in the review workflow.";
  if (code === "INVALID_CAPTION") return "Caption must contain 2–5000 characters.";
  if (code === "CONTENT_FIELD_TOO_LONG") return "One or more content fields exceed their allowed length.";
  if (code === "TOO_MANY_HASHTAGS") return "Use no more than 30 hashtags.";
  if (code === "INVALID_HASHTAG") return "Each hashtag must contain 1–100 characters.";
  return `Content workflow failed: ${code}`;
}
