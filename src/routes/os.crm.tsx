import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Ban, Flame, Pencil, Save, Search, ShieldAlert, UserRoundCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { dubaiInputValue, dubaiLocalToOffset, formatDubaiDateTime } from "../platform/dubai-time";
import {
  crmWorkflowErrorMessage,
  fetchLeads,
  LeadStageSchema,
  updateLeadWorkflow,
  type Lead,
  type LeadStage,
} from "../platform/os-crm-data";

export const Route = createFileRoute("/os/crm")({ component: CrmPage });

const terminalStages = new Set<LeadStage>(["booked", "customer", "lost"]);
const stageOptions = LeadStageSchema.options;

type LeadDraft = {
  leadId: string;
  stage: LeadStage;
  humanRequired: boolean;
  doNotContact: boolean;
  nextFollowUpLocal: string;
};

function nextAction(lead: Lead): string {
  if (lead.doNotContact) return "Do not contact";
  if (lead.humanRequired) return "Human review";
  if (lead.nextFollowUpAt) return `Follow-up · ${formatDubaiDateTime(lead.nextFollowUpAt)}`;
  if (lead.stage === "booked" || lead.stage === "customer") return "Customer care";
  if (lead.stage === "lost") return "Closed / lost";
  return "Qualify / book";
}

function CrmPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LeadDraft | null>(null);
  const leadsQuery = useQuery({ queryKey: ["os", "crm", "leads"], queryFn: fetchLeads, retry: false });

  const leads = useMemo(() => {
    const value = search.trim().toLocaleLowerCase();
    if (!value) return leadsQuery.data ?? [];
    return (leadsQuery.data ?? []).filter((lead) =>
      [lead.name, lead.phone ?? "", lead.channel, lead.stage, lead.intent]
        .join(" ")
        .toLocaleLowerCase()
        .includes(value),
    );
  }, [leadsQuery.data, search]);

  const workflowMutation = useMutation({
    mutationFn: updateLeadWorkflow,
    onSuccess: async (result) => {
      toast.success(
        result.followUpAttempt
          ? `Lead workflow saved. Follow-up attempt ${result.followUpAttempt} is queued.`
          : "Lead workflow saved.",
      );
      setEditingId(null);
      setDraft(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["os", "crm", "leads"] }),
        queryClient.invalidateQueries({ queryKey: ["os", "command-center"] }),
        queryClient.invalidateQueries({ queryKey: ["os", "operations"] }),
        queryClient.invalidateQueries({ queryKey: ["os", "inbox"] }),
      ]);
    },
    onError: (error) => {
      const code = error instanceof Error ? error.message : "CRM_WORKFLOW_FAILED";
      toast.error(crmWorkflowErrorMessage(code));
    },
  });

  function beginManage(lead: Lead) {
    setEditingId(lead.id);
    setDraft({
      leadId: lead.id,
      stage: lead.stage,
      humanRequired: lead.humanRequired,
      doNotContact: lead.doNotContact,
      nextFollowUpLocal: lead.nextFollowUpAt ? dubaiInputValue(lead.nextFollowUpAt) : "",
    });
  }

  function saveWorkflow() {
    if (!draft || workflowMutation.isPending) return;
    const followUpBlocked = draft.doNotContact || terminalStages.has(draft.stage);
    let nextFollowUpAt: string | null = null;

    if (!followUpBlocked && draft.nextFollowUpLocal.trim()) {
      nextFollowUpAt = dubaiLocalToOffset(draft.nextFollowUpLocal);
      if (!nextFollowUpAt) {
        toast.error("Choose a valid future Dubai follow-up date and time.");
        return;
      }
    }

    workflowMutation.mutate({
      leadId: draft.leadId,
      stage: draft.stage,
      humanRequired: draft.humanRequired,
      doNotContact: draft.doNotContact,
      nextFollowUpAt,
    });
  }

  return (
    <div>
      <h1 className="text-3xl font-black">CRM</h1>
      <p className="mt-2 text-muted-foreground">
        Real lead workflow from Supabase. Human flags, opt-out state, conversation modes, and follow-up jobs are updated together.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          className="w-full bg-transparent outline-none"
          placeholder="Search leads and customers"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {leadsQuery.isError && (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <ShieldAlert className="me-2 inline h-4 w-4" />
          {leadsQuery.error.message === "UNAUTHORIZED"
            ? "Staff session required. Sign in at /staff."
            : "Unable to load CRM data from Supabase."}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-start">
              <tr>
                <th className="p-4 text-start">Lead</th>
                <th className="p-4 text-start">Source</th>
                <th className="p-4 text-start">Stage</th>
                <th className="p-4 text-start">Intent</th>
                <th className="p-4 text-start">Score</th>
                <th className="p-4 text-start">Next action</th>
                <th className="p-4 text-start">Workflow</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const editing = editingId === lead.id && draft?.leadId === lead.id;
                const followUpBlocked = Boolean(draft && (draft.doNotContact || terminalStages.has(draft.stage)));
                return (
                  <>
                    <tr key={lead.id} className="border-t border-border">
                      <td className="p-4 font-bold">
                        {lead.name}
                        <div className="text-xs font-normal text-muted-foreground">{lead.phone ?? "No phone yet"}</div>
                      </td>
                      <td className="p-4 capitalize">{lead.channel}</td>
                      <td className="p-4">{lead.stage}</td>
                      <td className="p-4">{lead.intent}</td>
                      <td className="p-4">
                        <span className="font-black text-primary">{lead.score}</span>
                        {lead.score >= 80 && <Flame className="ms-1 inline h-4 w-4 text-orange-500" />}
                      </td>
                      <td className="p-4">
                        {nextAction(lead)}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {lead.humanRequired && (
                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-black text-destructive">
                              HUMAN REQUIRED
                            </span>
                          )}
                          {lead.doNotContact && (
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-800">
                              DNC
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          disabled={workflowMutation.isPending}
                          onClick={() => beginManage(lead)}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-black disabled:opacity-40"
                        >
                          <Pencil className="me-1 inline h-3.5 w-3.5" /> Manage
                        </button>
                      </td>
                    </tr>
                    {editing && draft && (
                      <tr key={`${lead.id}-workflow`} className="border-t border-primary/20 bg-primary/5">
                        <td colSpan={7} className="p-5">
                          <div className="grid gap-4 lg:grid-cols-4">
                            <label className="block text-xs font-black">
                              Stage
                              <select
                                value={draft.stage}
                                onChange={(event) => setDraft({ ...draft, stage: event.target.value as LeadStage })}
                                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none focus:border-primary"
                              >
                                {stageOptions.map((stage) => (
                                  <option key={stage} value={stage}>{stage}</option>
                                ))}
                              </select>
                            </label>

                            <label className="block text-xs font-black lg:col-span-2">
                              Next follow-up · Dubai time
                              <input
                                type="datetime-local"
                                disabled={followUpBlocked}
                                value={draft.nextFollowUpLocal}
                                onChange={(event) => setDraft({ ...draft, nextFollowUpLocal: event.target.value })}
                                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal outline-none focus:border-primary disabled:opacity-45"
                              />
                              {followUpBlocked && (
                                <span className="mt-1 block text-[11px] text-muted-foreground">
                                  Follow-up is automatically cleared for DNC, booked, customer, or lost leads.
                                </span>
                              )}
                            </label>

                            <div className="grid gap-2">
                              <label className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-xs font-black">
                                <input
                                  type="checkbox"
                                  checked={draft.humanRequired}
                                  onChange={(event) => setDraft({ ...draft, humanRequired: event.target.checked })}
                                />
                                <UserRoundCheck className="h-4 w-4 text-primary" /> Human required
                              </label>
                              <label className="flex items-center gap-2 rounded-lg border border-border bg-background p-3 text-xs font-black">
                                <input
                                  type="checkbox"
                                  checked={draft.doNotContact}
                                  onChange={(event) => setDraft({ ...draft, doNotContact: event.target.checked })}
                                />
                                <Ban className="h-4 w-4 text-amber-700" /> Do not contact
                              </label>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={workflowMutation.isPending}
                              onClick={saveWorkflow}
                              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground disabled:opacity-40"
                            >
                              <Save className="me-1 inline h-4 w-4" /> Save workflow
                            </button>
                            <button
                              type="button"
                              disabled={workflowMutation.isPending}
                              onClick={() => {
                                setEditingId(null);
                                setDraft(null);
                              }}
                              className="rounded-xl border border-border px-4 py-2.5 text-sm font-black disabled:opacity-40"
                            >
                              <X className="me-1 inline h-4 w-4" /> Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {!leadsQuery.isLoading && !leadsQuery.isError && leads.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-muted-foreground">No matching leads in Supabase.</td>
                </tr>
              )}
              {leadsQuery.isLoading && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-muted-foreground">Loading CRM data...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
