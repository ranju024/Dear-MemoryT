import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { studioAPI, photosAPI, getMediaUrl } from "@/lib/api/client";

export const Route = createFileRoute("/studio/$slug")({
  head: () => ({ meta: [{ title: "Studio — DearMemory" }] }),
  component: Studio,
});

function Studio() {
  const { slug } = Route.useParams();
  const [studio, setStudio] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [studioData, eventData] = await Promise.all([
          studioAPI.getBySlug(slug),
          studioAPI.getPublicEvents(slug),
        ]);
        setStudio(studioData);
        setEvents(eventData || []);

        const photoGroups = await Promise.all(
          (eventData || []).slice(0, 8).map((event: any) => photosAPI.list(event.id).catch(() => []))
        );
        setPortfolioPhotos(photoGroups.flat().slice(0, 24));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Studio not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    // A studio page does not have a single event to attach to. Use the first
    // published event when available; otherwise show a useful contact action
    // instead of pretending the form succeeded.
    if (!events[0]) {
      setSent(true);
      return;
    }
    try {
      const { leadsAPI } = await import("@/lib/api/client");
      await leadsAPI.createPublic(events[0].slug, {
        name: contact.name,
        email: contact.email || undefined,
        phone: contact.phone || undefined,
        notes: contact.message || undefined,
        source: "Public studio page",
      });
      setSent(true);
      setContact({ name: "", email: "", phone: "", message: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send your inquiry");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading studio…</div>;
  if (error || !studio) return <div className="min-h-screen flex items-center justify-center text-red-600">{error || "Studio not found"}</div>;

  const primary = studio.primary_color || "#4a7c6a";
  const background = studio.background_color || "#ffffff";

  return (
    <div className="min-h-screen" style={{ backgroundColor: background, color: studio.text_color || "#2d2a29" }}>
      <SiteNav />
      <header className="relative pt-16">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: primary }}>
            Photography Studio
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">{studio.name}</h1>
              <p className="font-serif italic text-xl md:text-2xl mt-4 opacity-75">{studio.tagline}</p>
              {studio.about && <p className="max-w-2xl mt-6 opacity-70 leading-relaxed">{studio.about}</p>}
            </div>
            {studio.logo && <img src={getMediaUrl(studio.logo)} alt={studio.name} className="w-28 h-28 rounded-3xl object-cover ring-1 ring-border" />}
          </div>
        </div>
      </header>

      <section className="py-12 bg-white/60 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ["Events", studio.total_events ?? events.length],
            ["Photos", studio.total_photos ?? portfolioPhotos.length],
            ["Location", studio.city || "Worldwide"],
            ["Rating", studio.rating || "5.0"],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <div className="text-2xl font-bold" style={{ color: primary }}>{value}</div>
              <div className="text-xs uppercase tracking-widest opacity-60 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {portfolioPhotos.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>Selected work</p>
            <h2 className="text-4xl md:text-5xl font-bold mt-2">Stories we've captured</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {portfolioPhotos.map((photo: any) => (
              <img key={photo.id} src={getMediaUrl(photo.url)} alt={photo.title || photo.filename} loading="lazy"
                className="w-full aspect-square object-cover rounded-2xl hover:scale-[1.02] transition-transform" />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>Published galleries</p>
          <h2 className="text-4xl md:text-5xl font-bold mt-2">Recent events</h2>
        </div>
        {events.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center opacity-70">No public galleries have been published yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <a key={event.id} href={`/event/${event.slug}`} className="bg-white rounded-3xl overflow-hidden ring-1 ring-border hover:shadow-lg transition-shadow">
                {event.cover_image ? <img src={getMediaUrl(event.cover_image)} alt="" className="w-full aspect-[4/3] object-cover" /> :
                  <div className="w-full aspect-[4/3] bg-cream" />}
                <div className="p-5">
                  <p className="text-xs uppercase tracking-widest opacity-60">{event.type}</p>
                  <h3 className="font-bold text-xl mt-1">{event.title}</h3>
                  <p className="text-sm opacity-60 mt-2">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="py-20" style={{ backgroundColor: `${primary}12` }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>Get in touch</p>
            <h2 className="text-4xl font-bold mt-2">Let's create something beautiful</h2>
          </div>
          {sent ? (
            <div className="bg-white rounded-3xl p-10 text-center ring-1 ring-border">
              Thanks — your inquiry has been received.
            </div>
          ) : (
            <form onSubmit={submitLead} className="bg-white rounded-3xl p-8 space-y-4 ring-1 ring-border">
              <input required value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} className="w-full bg-cream rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Your name" />
              <input type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} className="w-full bg-cream rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Email" />
              <input value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} className="w-full bg-cream rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Phone (optional)" />
              <textarea rows={5} value={contact.message} onChange={e => setContact({ ...contact, message: e.target.value })} className="w-full bg-cream rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Tell us about your event…" />
              <button type="submit" className="w-full text-white py-4 rounded-full font-bold" style={{ backgroundColor: primary }}>
                Request quote
              </button>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
