import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { EventDesignSidebar, parseDesignConfig, type DesignConfig } from "@/components/app/EventDesignSidebar";
import { eventsAPI, photosAPI, getMediaUrl } from "@/lib/api/client";

export const Route = createFileRoute("/dashboard/builder")({
  head: () => ({ meta: [{ title: "Website Builder — DearMemory" }] }),
  component: Builder,
});

function Builder() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [config, setConfig] = useState<DesignConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    eventsAPI.list().then((data) => {
      setEvents(data || []);
      if (data?.[0]) setEvent(data[0]);
    }).catch((e) => setMessage(e.message));
  }, []);

  useEffect(() => {
    if (!event) return;
    setConfig(parseDesignConfig(event.design_config));
    photosAPI.list(event.id).then(setPhotos).catch(() => setPhotos([]));
  }, [event]);

  const save = async () => {
    if (!event || !config) return;
    setSaving(true);
    try {
      const updated = await eventsAPI.update(event.id, { design_config: JSON.stringify(config) });
      setEvent(updated);
      setMessage("Saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Couldn't save");
    } finally { setSaving(false); }
  };

  if (!event || !config) {
    return <AppShell title="Website Builder" subtitle="Choose an event">
      <div className="bg-white rounded-2xl ring-1 ring-border p-8">
        {events.length === 0 ? "Create an event first." : "Loading event…"}
        {message && <p className="text-red-600 mt-3">{message}</p>}
      </div>
    </AppShell>;
  }

  return (
    <AppShell
      title="Website Builder"
      subtitle={event.title}
      action={
        <div className="flex gap-2">
          <select value={event.id} onChange={e => setEvent(events.find(x => x.id === Number(e.target.value)))} className="bg-white ring-1 ring-border rounded-full px-4 py-2 text-sm">
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <button onClick={() => navigate({ to: "/event/$slug", params: { slug: event.slug } })} className="bg-white ring-1 ring-border px-4 py-2 rounded-full text-sm font-semibold">Preview</button>
          <button onClick={save} disabled={saving} className="bg-emerald text-white px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
        </div>
      }
    >
      <div className="flex gap-4 h-[calc(100vh-200px)]">
        <EventDesignSidebar config={config} onChange={setConfig} variant="card" />
        <div className="flex-1 bg-cream rounded-2xl p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl overflow-hidden max-w-4xl mx-auto shadow">
            {config.sections.filter(s => s.visible).map(section => {
              if (section.type === "cover") return (
                <div key={section.id} className="relative h-80 bg-gray-200">
                  {event.cover_image && <img src={getMediaUrl(event.cover_image)} className="w-full h-full object-cover" alt="" />}
                  <div className="absolute inset-0 bg-black/30 flex items-end p-8 text-white">
                    <div><div className="text-xs uppercase tracking-widest">{event.type}</div><h1 className="text-4xl font-bold">{event.title}</h1><p>{event.subtitle}</p></div>
                  </div>
                </div>
              );
              if (section.type === "gallery") return (
                <div key={section.id} className="p-6">
                  <h2 className="font-bold text-2xl mb-4">Gallery</h2>
                  {photos.length ? <div className="grid grid-cols-3 gap-2">{photos.slice(0, 9).map(p => <img key={p.id} src={getMediaUrl(p.url)} className="aspect-square object-cover rounded-lg" alt="" />)}</div> : <p className="text-warm-gray">Upload photos to see them here.</p>}
                </div>
              );
              if (section.type === "info") return <div key={section.id} className="p-8 text-center"><h2 className="text-2xl font-bold">{event.title}</h2><p className="mt-2">{new Date(event.date).toLocaleDateString()}</p><p className="mt-4 text-warm-gray">{event.description || "Add an event description."}</p></div>;
              if (section.type === "guestbook") return <div key={section.id} className="p-8 text-center bg-cream/50"><h2 className="text-2xl font-bold">Guestbook</h2><p className="text-warm-gray mt-2">Guests can leave messages on the public gallery.</p></div>;
              return <div key={section.id} className="p-8 text-center"><h2 className="text-2xl font-bold">{config.contact.buttonLabel}</h2><p className="text-warm-gray mt-2">A contact form will be available on the public page.</p></div>;
            })}
          </div>
        </div>
      </div>
      {message && <div className="mt-3 text-sm text-warm-gray">{message}</div>}
    </AppShell>
  );
}
