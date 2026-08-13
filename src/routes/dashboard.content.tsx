import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { eventsAPI, photosAPI, getMediaUrl } from "@/lib/api/client";

export const Route = createFileRoute("/dashboard/content")({
  head: () => ({ meta: [{ title: "Content — DearMemory" }] }),
  component: Content,
});

function Content() {
  const [event, setEvent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  useEffect(() => {
    eventsAPI.list().then(async (events) => {
      const e = events?.[0];
      if (!e) return;
      setEvent(e);
      setPhotos(await photosAPI.list(e.id));
    }).catch(() => {});
  }, []);

  return (
    <AppShell headerTabs={[{ label: "Content", active: true, href: "/dashboard/content" }, { label: "Customize", href: "/dashboard/customize" }]} hideSidebar>
      {!event ? <div className="text-center py-20 text-warm-gray">Create an event first to manage its content.</div> :
        <div className="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden shadow ring-1 ring-border">
          <div className="relative">
            {event.cover_image ? <img src={getMediaUrl(event.cover_image)} className="w-full aspect-[16/9] object-cover" alt="" /> : <div className="w-full aspect-[16/9] bg-cream" />}
            <div className="absolute inset-0 bg-black/30 flex items-end p-8 text-white">
              <div><div className="text-xs uppercase tracking-widest">{event.type}</div><h1 className="text-4xl font-bold">{event.title}</h1><p>{event.subtitle}</p></div>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div><div className="font-bold">{photos.length} photos</div><div className="text-sm text-warm-gray">Edit the public page layout in Website Builder.</div></div>
            <Link to="/dashboard/builder" className="bg-emerald text-white px-5 py-2 rounded-full font-semibold">Open builder</Link>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1">
            {photos.slice(0, 9).map(p => <img key={p.id} src={getMediaUrl(p.url)} className="aspect-square object-cover" alt="" />)}
          </div>
        </div>}
    </AppShell>
  );
}
