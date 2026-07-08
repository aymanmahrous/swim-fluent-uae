import { createFileRoute } from "@tanstack/react-router";
import { Flame, Search } from "lucide-react";
import { loadPlatformSnapshot } from "../platform/data";

export const Route = createFileRoute("/os/crm")({ component: CrmPage });

function CrmPage() {
  const snapshot = loadPlatformSnapshot();
  return (
    <div>
      <h1 className="text-3xl font-black">CRM</h1>
      <p className="mt-2 text-muted-foreground">
        Lead journey, score and next action in one place.
      </p>
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          className="w-full bg-transparent outline-none"
          placeholder="Search leads and customers"
        />
      </div>
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
              {snapshot.leads.map((lead) => (
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
                    {lead.humanRequired
                      ? "Coach review"
                      : lead.nextFollowUpAt
                        ? "Follow-up"
                        : "Qualify / book"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
