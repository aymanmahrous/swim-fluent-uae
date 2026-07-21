import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { LeadStageSchema } from "../platform/os-crm-data";
import { hasStaffPermission } from "../platform/staff-rbac";
import {
  resolveStaffSession,
  sessionCookieHeaders,
  staffRpc,
} from "../platform/staff-session.server";

const LeadWorkflowSchema = z.object({
  leadId: z.string().uuid(),
  stage: LeadStageSchema,
  humanRequired: z.boolean(),
  doNotContact: z.boolean(),
  nextFollowUpAt: z.string().datetime({ offset: true }).nullable(),
});

export const Route = createFileRoute("/api/os-crm-update")({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        const session = await resolveStaffSession(request);
        if (!session) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

        if (!hasStaffPermission(session.profile.role, "crm.workflow.update")) {
          return Response.json({ error: "FORBIDDEN" }, { status: 403 });
        }

        const body: unknown = await request.json().catch(() => null);
        const parsed = LeadWorkflowSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ success: false, code: "INVALID_INPUT" }, { status: 400 });
        }

        const response = await staffRpc(session.accessToken, "update_staff_lead_workflow", {
          p_lead_id: parsed.data.leadId,
          p_stage: parsed.data.stage,
          p_human_required: parsed.data.humanRequired,
          p_do_not_contact: parsed.data.doNotContact,
          p_next_follow_up_at: parsed.data.nextFollowUpAt,
        });

        return new Response(await response.text(), {
          status: response.status,
          headers: sessionCookieHeaders(session),
        });
      },
    },
  },
});
