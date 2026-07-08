import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Flame, Search, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/os/crm")({ component: CrmPage });

const LeadSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  channel: z.enum(["instagram", "facebook", "whatsapp", "website"]),
  stage: z.enum([
    "new",
    "contacted",
    "qualified",
    "booking_intent",
    "booked",
    "follow_up",
    "lost",
    "customer",
  ]),
  score: z.number().int(),
  language: z.enum(["ar", "en"]),
  intent: z.string(),
  fearOfWater: z.boolean().nullable().optional(),
  lastActivityAt: z.string(),
  nextFollowUpAt: z.string().nullable().optional(),
  humanRequired: z.boolean(),
  doNotContact: z.boolean(),
});

type Lead = z.infer<typeof LeadSchema>;

async function fetchLeads(): Promise<Lead[]> {
  const response = await fetch("/api/os-crm", { headers: { Accept: "application/json" } });
  if (response.status === 401) throw new Error("UNAUTHORIZED");
  if (!response.ok) throw new Error("CRM_UNAVAILABLE");
  const parsed = z.array(LeadSchema).safeParse(await response.json());
  if (!parsed.success) throw new Error("INVALID_CRM_RESPONSE");
  return parsed.data;
}

function CrmPage() {
  const [search, setSearch] = useState("");
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

  return (
    <div>
      <h1 className="text-3xl font-black">CRM</h1>
      <p className="mt-2 text-muted-foreground">
        Real lead journey, score and next action from Supabase.
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
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-border">
                  <td className="p-4 font-bold">
                    {lead.name}
                    <div className="text-xs font-normal text-muted-foreground">
                      {lead.phone ?? "No phone yet"}
                    </div>
                  </td>
                  <td className="p-4 capitalize">{lead.channel}</td>
                  <td className="p-4">{lead.stage}</td>
                  <td className="p-4">{lead.intent}</td>
                  <td className="p-4">
                    <span className="font-black text-primary">{lead.score}</span>
                    {lead.score >= 80 && <Flame className="ms-1 inline h-4 w-4 text-orange-500" />}
                  </td>
                  <td className="p-4">
                    {lead.doNotContact
                      ? "Do not contact"
                      : lead.humanRequired
                        ? "Coach review"
                        : lead.nextFollowUpAt
                          ? "Follow-up"
                          : lead.stage === "booked" || lead.stage === "customer"
                            ? "Customer care"
                            : "Qualify / book"}
                  </td>
                </tr>
              ))}
              {!leadsQuery.isLoading && !leadsQuery.isError && leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    No matching leads in Supabase.
                  </td>
                </tr>
              )}
              {leadsQuery.isLoading && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted-foreground">
                    Loading CRM data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
