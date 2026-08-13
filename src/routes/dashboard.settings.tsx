import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { studioAPI } from "@/lib/api/client";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — DearMemory" }] }),
  component: Settings,
});

function Settings() {
  const [studio, setStudio] = useState<any>(null);
  const [tab, setTab] = useState("Studio");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    studioAPI.getMe().then(setStudio).catch(e => setMessage(e.message));
  }, []);

  const update = (key: string, value: string) => setStudio((s: any) => ({ ...s, [key]: value }));
  const save = async () => {
    if (!studio) return;
    setSaving(true); setMessage("");
    try {
      const updated = await studioAPI.update({
        name: studio.name, tagline: studio.tagline, about: studio.about,
        city: studio.city, country: studio.country, email: studio.email,
        phone: studio.phone, website: studio.website, instagram: studio.instagram,
        founded_year: studio.founded_year ? Number(studio.founded_year) : undefined,
        base_price: studio.base_price,
      });
      setStudio(updated); setMessage("Settings saved.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Couldn't save"); }
    finally { setSaving(false); }
  };

  const tabs = ["Studio", "Domains", "Billing", "Notifications", "Integrations", "Security"];
  return (
    <AppShell title="Settings" subtitle="Manage your studio.">
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-[1.5rem] ring-1 ring-border p-3">
            {tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm ${tab === t ? "bg-emerald-light text-emerald-deep font-semibold" : "hover:bg-cream"}`}>{t}</button>)}
          </div>
        </aside>
        <div className="col-span-12 lg:col-span-9">
          {tab !== "Studio" ? (
            <div className="bg-white rounded-[2rem] p-8 ring-1 ring-border">
              <h2 className="font-bold text-xl">{tab}</h2>
              <p className="text-warm-gray mt-2">This section is planned for the next product milestone. It is intentionally not showing fake production settings.</p>
            </div>
          ) : !studio ? (
            <div className="bg-white rounded-[2rem] p-8 ring-1 ring-border">Loading studio settings…</div>
          ) : (
            <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border space-y-6">
              <div><div className="font-bold mb-1">Studio profile</div><div className="text-sm text-warm-gray">This information appears on your public studio page.</div></div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  ["name","Studio name"],["tagline","Tagline"],["email","Contact email"],["phone","Phone"],
                  ["city","City"],["country","Country"],["website","Website"],["instagram","Instagram"],
                  ["base_price","Starting price"],["founded_year","Founded year"],
                ].map(([key,label]) => <Field key={key} label={label} value={studio[key] ?? ""} onChange={(v) => update(key,v)} />)}
              </div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-warm-gray block mb-2">About</label><textarea rows={5} value={studio.about ?? ""} onChange={e => update("about", e.target.value)} className="w-full bg-cream rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald/30" /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-warm-gray">{message}</span><button onClick={save} disabled={saving} className="bg-emerald text-white px-6 py-3 rounded-full font-semibold disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button></div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string | number; onChange: (v: string) => void }) {
  return <div><label className="text-xs font-bold uppercase tracking-widest text-warm-gray block mb-2">{label}</label><input value={value} onChange={e => onChange(e.target.value)} className="w-full bg-cream rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald/30" /></div>;
}
