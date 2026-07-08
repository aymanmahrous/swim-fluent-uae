import { z } from "zod";

export const LeadStageSchema = z.enum([
  "new",
  "contacted",
  "qualified",
  "booking_intent",
  "booked",
  "follow_up",
  "lost",
  "customer",
]);

export const LeadSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  channel: z.enum(["instagram", "facebook", "whatsapp", "website"]),
  stage: LeadStageSchema,
  score: z.number().int(),
  language: z.enum(["ar", "en"]),
  intent: z.string(),
  fearOfWater: z.boolean().nullable().optional(),
  lastActivityAt: z.string(),
  nextFollowUpAt: z.string().nullable().optional(),
  humanRequired: z.boolean(),
  doNotContact: z.boolean(),
});

const LeadWorkflowResultSchema = z.object({
  success: z.literal(true),
  leadId: z.string().uuid(),
  stage: LeadStageSchema,
  humanRequired: z.boolean(),
  doNotContact: z.boolean(),
  nextFollowUpAt: z.string().nullable(),
  followUpAttempt: z.number().int().min(1).max(3).nullable(),
  updatedAt: z.string(),
});

const LeadWorkflowErrorSchema = z.object({
  success: z.literal(false).optional(),
  code: z.string(),
});

export type Lead = z.infer<typeof LeadSchema>;
export type LeadStage = z.infer<typeof LeadStageSchema>;

export type LeadWorkflowInput = {
  leadId: string;
  stage: LeadStage;
  humanRequired: boolean;
  doNotContact: boolean;
  nextFollowUpAt: string | null;
};

export async function fetchLeads(): Promise<Lead[]> {
  const response = await fetch("/api/os-crm", { headers: { Accept: "application/json" } });
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) throw new Error("CRM_UNAVAILABLE");
  const parsed = z.array(LeadSchema).safeParse(await response.json());
  if (!parsed.success) throw new Error("INVALID_CRM_RESPONSE");
  return parsed.data;
}

export async function updateLeadWorkflow(input: LeadWorkflowInput) {
  const response = await fetch("/api/os-crm-update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = LeadWorkflowErrorSchema.safeParse(body);
    throw new Error(error.success ? error.data.code : `CRM_WORKFLOW_HTTP_${response.status}`);
  }

  const result = LeadWorkflowResultSchema.safeParse(body);
  if (!result.success) {
    const businessError = LeadWorkflowErrorSchema.safeParse(body);
    throw new Error(businessError.success ? businessError.data.code : "INVALID_CRM_WORKFLOW_RESPONSE");
  }
  return result.data;
}

export function crmWorkflowErrorMessage(code: string): string {
  if (code === "INVALID_STAGE") return "The selected lead stage is invalid.";
  if (code === "INVALID_FOLLOW_UP_TIME") return "Choose a future Dubai follow-up date and time.";
  if (code === "FOLLOW_UP_TOO_FAR") return "Follow-up must be within 366 days.";
  if (code === "FOLLOW_UP_LIMIT_REACHED") return "This lead already reached the maximum of three completed follow-up attempts.";
  if (code === "NOT_FOUND") return "The lead no longer exists.";
  return `CRM workflow failed: ${code}`;
}
