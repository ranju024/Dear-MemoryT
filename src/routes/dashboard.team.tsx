import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { leadsAPI } from "@/lib/api/client";

export const Route = createFileRoute("/dashboard/team")({
  head: () => ({ meta: [{ title: "Leads & CRM — DearMemory" }] }),
  component: Leads,
});

const STATUSES = ["New", "Contacted", "Quoted", "Booked", "Lost"];

function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = () => {
    setLoading(true);
    leadsAPI.list(filter === "All" ? undefined : filter).then(setLeads).catch(e => setMessage(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const updateStatus = async (id: number, status: string) => {
    try { const updated = await leadsAPI.updateStatus(id, status); setLeads(prev => prev.map(l => l.id === id ? updated : l)); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Couldn't update lead"); }
  };
  const remove = async (id: number) => {
    if (!window.confirm("Delete this lead?")) return;
    try { await leadsAPI.delete(id); setLeads(prev => prev.filter(l => l.id !== id)); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Couldn't delete lead"); }
  };

  return <AppShell title="Leads & CRM" subtitle="Turn inquiries into booked work.">
    <div className="flex gap-2 flex-wrap mb-6">{["All", ...STATUSES].map(s => <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-sm font-semibold ${filter === s ? "bg-emerald text-white" : "bg-white ring-1 ring-border text-warm-gray"}`}>{s}</button>)}</div>
    {message && <div className="mb-4 text-sm text-red-600">{message}</div>}
    <div className="bg-white rounded-2xl ring-1 ring-border overflow-hidden">
      {loading ? <div className="p-10 text-center text-warm-gray">Loading leads…</div> : leads.length === 0 ? <div className="p-10 text-center text-warm-gray">No leads yet. Public event and studio contact forms will appear here.</div> :
        <div className="divide-y divide-border">{leads.map(lead => <div key={lead.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 min-w-0"><div className="font-bold">{lead.name}</div><div className="text-sm text-warm-gray">{lead.email || "No email"} {lead.phone ? `· ${lead.phone}` : ""}</div><div className="text-xs text-warm-gray mt-1">{lead.event_type || "General inquiry"} · {lead.source || "Unknown source"}</div>{lead.notes && <p className="text-sm mt-2">{lead.notes}</p>}</div>
          <select value={lead.status} onChange={e => updateStatus(lead.id,e.target.value)} className="bg-cream rounded-xl px-3 py-2 text-sm font-semibold">{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
          <button onClick={() => remove(lead.id)} className="text-sm text-red-600 hover:underline">Delete</button>
        </div>)}</div>}
    </div>
  </AppShell>;
}
