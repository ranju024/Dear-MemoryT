import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { eventsAPI } from "@/lib/api/client";
import { parseDesignConfig, type DesignConfig } from "@/components/app/EventDesignSidebar";

export const Route = createFileRoute("/dashboard/customize")({
  head: () => ({ meta: [{ title: "Customize — DearMemory" }] }),
  component: Customize,
});

function Customize() {
  const [event, setEvent] = useState<any>(null);
  const [config, setConfig] = useState<DesignConfig | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    eventsAPI.list().then((events) => {
      const e = events?.[0];
      if (e) { setEvent(e); setConfig(parseDesignConfig(e.design_config)); }
    }).catch(() => {});
  }, []);
  const save = async () => {
    if (!event || !config) return;
    setSaving(true);
    try { const updated = await eventsAPI.update(event.id, { design_config: JSON.stringify(config) }); setEvent(updated); }
    finally { setSaving(false); }
  };
  if (!event || !config) return <AppShell title="Customize"><div className="text-center py-16 text-warm-gray">Create an event first.</div></AppShell>;
  return <AppShell headerTabs={[{label:"Content",href:"/dashboard/content"},{label:"Customize",active:true,href:"/dashboard/customize"}]} hideSidebar action={<button onClick={save} disabled={saving} className="bg-emerald text-white px-5 py-2 rounded-full font-semibold">{saving ? "Saving…" : "Save"}</button>}>
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl ring-1 ring-border p-5">
        <div className="font-bold mb-1">Gallery section</div>
        <div className="text-xs text-warm-gray mb-5">These settings are saved to the selected event's public page.</div>
        <Block label="Layout"><div className="grid grid-cols-3 gap-2">{(["Grid","Masonry","Carousel"] as const).map(l => <button key={l} onClick={() => setConfig({...config,gallery:{...config.gallery,layout:l}})} className={`text-xs font-semibold py-2 rounded-xl ${config.gallery.layout === l ? "bg-emerald text-white" : "bg-cream"}`}>{l}</button>)}</div></Block>
        <Block label={`Columns · ${config.gallery.columns}`}><input type="range" value={config.gallery.columns} onChange={e=>setConfig({...config,gallery:{...config.gallery,columns:Number(e.target.value)}})} min={1} max={6} className="w-full accent-emerald" /></Block>
        <Block label={`Spacing · ${config.gallery.spacing}`}><input type="range" value={config.gallery.spacing} onChange={e=>setConfig({...config,gallery:{...config.gallery,spacing:Number(e.target.value)}})} min={0} max={12} className="w-full accent-emerald" /></Block>
        <Block label={`Corner radius · ${config.gallery.radius}`}><input type="range" value={config.gallery.radius} onChange={e=>setConfig({...config,gallery:{...config.gallery,radius:Number(e.target.value)}})} min={0} max={32} className="w-full accent-emerald" /></Block>
      </div>
    </div>
  </AppShell>;
}
function Block({label,children}:{label:string;children:React.ReactNode}) { return <div className="mb-5"><div className="text-[10px] font-bold uppercase tracking-widest text-warm-gray mb-2">{label}</div>{children}</div>; }
