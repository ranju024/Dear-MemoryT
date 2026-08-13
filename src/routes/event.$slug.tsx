// import { createFileRoute, Link, useParams } from "@tanstack/react-router";
// import { SiteNav } from "@/components/site/SiteNav";
// import { SiteFooter } from "@/components/site/SiteFooter";
// import { EVENTS, PHOTOS } from "@/lib/mock/data";

// export const Route = createFileRoute("/event/$slug")({
//   head: ({ params }) => {
//     const ev = EVENTS.find((e) => e.slug === params.slug) ?? EVENTS[0];
//     return {
//       meta: [
//         { title: `${ev.title} — DearMemory` },
//         { name: "description", content: `${ev.subtitle} · ${ev.date}. View the full gallery on DearMemory.` },
//         { property: "og:title", content: ev.title },
//         { property: "og:description", content: `${ev.subtitle} · ${ev.date}` },
//         { property: "og:image", content: ev.cover },
//       ],
//     };
//   },
//   component: Event,
// });

// const GALLERY = [
//   PHOTOS.weddingHero, PHOTOS.weddingCouple, PHOTOS.weddingFlowers, PHOTOS.weddingDetails,
//   PHOTOS.weddingDance, PHOTOS.portfolio1, PHOTOS.portfolio2, PHOTOS.portfolio3,
//   PHOTOS.weddingFlowers, PHOTOS.weddingHero, PHOTOS.weddingDetails, PHOTOS.weddingDance,
// ];

// function Event() {
//   const { slug } = useParams({ from: "/event/$slug" });
//   const ev = EVENTS.find((e) => e.slug === slug) ?? EVENTS[0];

//   return (
//     <div className="bg-background">
//       <SiteNav />
//       {/* Hero */}
//       <header className="relative">
//         <div className="aspect-[16/10] md:aspect-[21/9] overflow-hidden">
//           <img src={ev.cover} alt="" className="w-full h-full object-cover" />
//           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/10 to-foreground/60" />
//         </div>
//         <div className="absolute inset-0 flex items-end">
//           <div className="container mx-auto px-6 pb-16 text-white">
//             <div className="text-xs font-bold uppercase tracking-widest mb-3 opacity-80">{ev.type}</div>
//             <h1 className="text-4xl md:text-7xl font-bold tracking-tight">{ev.title}</h1>
//             <p className="font-serif italic text-xl md:text-3xl mt-3 opacity-90">{ev.subtitle}</p>
//             <p className="text-sm mt-4 opacity-70 uppercase tracking-widest">{ev.date}</p>
//           </div>
//         </div>
//       </header>

//       {/* Toolbar */}
//       <div className="sticky top-[57px] z-40 bg-background/80 backdrop-blur-md border-b border-border">
//         <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
//           <div className="flex items-center gap-2 bg-white rounded-full ring-1 ring-border px-4 py-2 flex-1 max-w-md">
//             <span className="text-emerald font-bold text-xs">AI</span>
//             <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-warm-gray" placeholder="Find yourself in this gallery…" />
//           </div>
//           <div className="flex items-center gap-2">
//             <button className="hidden md:inline px-4 py-2 rounded-full ring-1 ring-border bg-white text-sm font-semibold hover:bg-cream">Favorites</button>
//             <button className="hidden md:inline px-4 py-2 rounded-full ring-1 ring-border bg-white text-sm font-semibold hover:bg-cream">Share</button>
//             <button className="px-4 py-2 rounded-full bg-emerald text-white text-sm font-semibold hover:bg-emerald-deep">Download all</button>
//           </div>
//         </div>
//       </div>

//       {/* Story chapter */}
//       <section className="py-20">
//         <div className="container mx-auto px-6 max-w-3xl text-center">
//           <div className="text-xs font-bold uppercase tracking-widest text-emerald mb-4">Chapter I</div>
//           <h2 className="font-serif italic text-3xl md:text-5xl leading-tight">"The way you held her hand told us everything we needed to know."</h2>
//         </div>
//       </section>

//       {/* Gallery */}
//       <section className="container mx-auto px-6 pb-24">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           {GALLERY.map((src, i) => (
//             <div key={i} className={`rounded-2xl overflow-hidden ${i % 5 === 0 ? "row-span-2" : ""}`}>
//               <img src={src} alt="" className={`w-full object-cover ${i % 5 === 0 ? "aspect-[3/4] h-full" : "aspect-square"} hover:scale-105 transition-transform duration-700`} loading="lazy" />
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Guestbook */}
//       <section className="py-24 bg-emerald-light/40">
//         <div className="container mx-auto px-6 max-w-3xl">
//           <div className="text-center mb-12">
//             <div className="text-xs font-bold uppercase tracking-widest text-emerald mb-3">Guestbook</div>
//             <h2 className="text-3xl md:text-5xl font-bold">Notes from the day</h2>
//           </div>
//           <div className="space-y-4 mb-10">
//             {[
//               { name: "Mom", text: "I cried watching you walk down the aisle. I'll never forget the look on your face." },
//               { name: "Marco", text: "Best wedding ever! The food, the dancing, the love — perfect." },
//               { name: "Léa", text: "Thank you for letting us be part of your day. We love you both." },
//             ].map((n, i) => (
//               <div key={i} className="bg-white rounded-3xl p-6 ring-1 ring-border">
//                 <p className="font-serif italic text-lg mb-3">"{n.text}"</p>
//                 <div className="text-sm font-bold text-warm-gray">— {n.name}</div>
//               </div>
//             ))}
//           </div>
//           <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border">
//             <input className="w-full mb-3 bg-cream rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Your name" />
//             <textarea rows={3} className="w-full mb-4 bg-cream rounded-2xl px-4 py-3 text-sm outline-none" placeholder="Leave a note…" />
//             <button type="button" className="bg-emerald text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-deep transition-colors">Sign guestbook</button>
//           </div>
//         </div>
//       </section>

//       <section className="py-16 text-center container mx-auto px-6">
//         <p className="text-warm-gray mb-4">Photographed by</p>
//         <Link to="/studio/$slug" params={{ slug: "goldenhour" }} className="text-2xl font-bold text-emerald hover:underline">Goldenhour Studio</Link>
//       </section>

//       <SiteFooter />
//     </div>
//   );
// }


import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { eventsAPI, photosAPI, guestbookAPI, leadsAPI, studioAPI, getMediaUrl, clearToken } from "@/lib/api/client";
import { ImageLightbox } from "@/components/ImageLightbox";
import { Heart, Share2, Download, Search } from "lucide-react";
import { parseDesignConfig, type DesignConfig } from "@/components/app/EventDesignSidebar";

export const Route = createFileRoute("/event/$slug")({
  head: () => ({ meta: [{ title: "Gallery — DearMemory" }] }),
  component: EventGallery,
});

const COVER_HEIGHTS: Record<string, string> = {
  Small: "20rem",
  Medium: "36rem",
  Large: "44rem",
};

function EventGallery() {
  const { slug } = useParams({ from: "/event/$slug" });
  const [event, setEvent] = useState<any>(null);
  const [studio, setStudio] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [config, setConfig] = useState<DesignConfig | null>(null);

  // Guestbook state
  const [guestEntries, setGuestEntries] = useState<any[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [guestFeedback, setGuestFeedback] = useState<string | null>(null);

  // Contact / booking form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactFeedback, setContactFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await eventsAPI.getBySlug(slug);
        const photosData = await photosAPI.list(eventData.id);

        setEvent(eventData);
        setPhotos(photosData || []);
        setConfig(parseDesignConfig(eventData.design_config));

        if (eventData.owner_id) {
          try {
            const studioData = await studioAPI.getUser(eventData.owner_id);
            setStudio(studioData);
          } catch {
            setStudio(null);
          }
        }

        try {
          const entries = await guestbookAPI.list(eventData.id);
          setGuestEntries(entries || []);
        } catch {
          setGuestEntries([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  const handleSignGuestbook = async () => {
    if (!event || !guestName.trim() || !guestMessage.trim()) return;
    setGuestSubmitting(true);
    setGuestFeedback(null);
    try {
      const entry = await guestbookAPI.sign(event.id, { name: guestName, message: guestMessage });
      if (entry?.approved) {
        setGuestEntries((prev) => [entry, ...prev]);
        setGuestFeedback("Thanks — your note is live!");
      } else {
        setGuestFeedback("Thanks — your note is awaiting approval from the studio.");
      }
      setGuestName("");
      setGuestMessage("");
    } catch (err) {
      setGuestFeedback(err instanceof Error ? err.message : "Couldn't post your note — try again.");
    } finally {
      setGuestSubmitting(false);
    }
  };

  const handleContactSubmit = async () => {
    if (!event || !contactName.trim()) return;
    setContactSubmitting(true);
    setContactFeedback(null);
    try {
      await leadsAPI.createPublic(event.slug, {
        name: contactName,
        email: contactEmail || undefined,
        phone: contactPhone || undefined,
        notes: contactMessage || undefined,
        source: "Event page inquiry",
      });
      setContactFeedback("Thanks! The studio will be in touch soon.");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactMessage("");
    } catch (err) {
      setContactFeedback(err instanceof Error ? err.message : "Couldn't send that — try again.");
    } finally {
      setContactSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !event || !config) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600">{error || "Event not found"}</div>
      </div>
    );
  }

  const heroPhotos = photos.slice(0, 1);
  const chapterOnePhotos = photos.slice(1, 5);
  const chapterTwoPhotos = photos.slice(5, 9);
  const chapterThreePhotos = photos.slice(9);

  const visibleSections = config.sections.filter((s) => s.visible);
  const galleryCols = Math.min(Math.max(config.gallery.columns, 1), 6);
  const galleryGapPx = config.gallery.spacing * 2;
  const galleryRadiusPx = config.gallery.radius;

  const renderPhotoGrid = (list: any[]) => (
    <div
      className="grid grid-cols-2"
      style={{
        gridTemplateColumns: `repeat(${Math.min(galleryCols, 4)}, minmax(0, 1fr))`,
        gap: `${galleryGapPx}px`,
      }}
    >
      {list.map((photo) => (
        <div
          key={photo.id}
          className="aspect-square overflow-hidden cursor-pointer group"
          style={{ borderRadius: `${galleryRadiusPx}px` }}
          onClick={() => {
            setLightboxIndex(photos.indexOf(photo));
            setLightboxOpen(true);
          }}
        >
          <img
            src={getMediaUrl(photo.url)}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      ))}
    </div>
  );

  const renderPhotoCarousel = (list: any[]) => (
    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
      {list.map((photo) => (
        <div
          key={photo.id}
          className="shrink-0 w-64 aspect-square overflow-hidden cursor-pointer snap-start"
          style={{ borderRadius: `${galleryRadiusPx}px` }}
          onClick={() => {
            setLightboxIndex(photos.indexOf(photo));
            setLightboxOpen(true);
          }}
        >
          <img
            src={getMediaUrl(photo.url)}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );

  const renderGalleryBlock = (list: any[]) =>
    config.gallery.layout === "Carousel" ? renderPhotoCarousel(list) : renderPhotoGrid(list);

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        "--brand-primary": studio?.primary_color ?? "#10b981",
        "--brand-text": studio?.text_color ?? "#111827",
      } as React.CSSProperties}
    >
      {lightboxOpen && (
        <ImageLightbox
          images={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onFavorite={async (photoId) => {
            try {
              const updated = await photosAPI.favorite(photoId);
              setPhotos((prev) => prev.map((p) => p.id === photoId ? updated : p));
            } catch {
              // Keep the gallery usable if a favorite request fails.
            }
          }}
        />
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {studio?.logo ? (
              <img
                src={getMediaUrl(studio.logo)}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "var(--brand-primary)" }} />
            )}
            <span className="font-bold">DearMemory</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm text-gray-600">
            <a href="/">Templates</a>
            <a href="/">Showcase</a>
            <a href="/">Features</a>
            <a href="/">Pricing</a>
          </div>
          <div className="flex gap-2">
            <a href="/dashboard" className="text-sm text-gray-600">Dashboard</a>
            <button
              onClick={() => { clearToken(); window.location.href = "/login"; }}
              className="px-4 py-2 text-white rounded-full text-sm font-semibold"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {visibleSections.map((section) => {
        if (section.type === "cover") {
          const justify = { Left: "flex-start", Center: "center", Right: "flex-end" }[
            config.cover.titleAlign
          ];
          const textAlign = { Left: "left", Center: "center", Right: "right" }[
            config.cover.titleAlign
          ] as "left" | "center" | "right";
          return (
            <div
              key={section.id}
              className="relative mt-16 bg-black/40"
              style={{
                height: COVER_HEIGHTS[config.cover.height],
                backgroundImage: `url(${getMediaUrl(event.cover_image || "/placeholder.png")})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                className="absolute inset-0"
                style={{ background: `rgba(0,0,0,${config.cover.overlay / 100})` }}
              />
              <div className="absolute inset-0 flex items-end" style={{ justifyContent: justify }}>
                <div className="max-w-7xl mx-auto px-8 md:px-16 pb-8 md:pb-16 text-white w-full" style={{ textAlign }}>
                  <div className="text-xs uppercase tracking-widest opacity-75 mb-4">{event.type}</div>
                  <h1 className="text-5xl md:text-7xl font-bold mb-4">{event.title}</h1>
                  <p className="text-xl md:text-2xl italic opacity-90">{event.subtitle}</p>
                  <p className="text-sm opacity-75 mt-6">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        }

        if (section.type === "gallery") {
          return (
            <div key={section.id} className="max-w-7xl mx-auto px-6 py-16">
              {/* Search and Actions */}
              <div className="flex flex-col md:flex-row gap-4 mb-16 items-start md:items-center justify-between">
                <div className="w-full md:w-auto flex-1 max-w-md">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-3">
                    <Search size={18} className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Find yourself in this gallery…"
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-full text-sm font-semibold hover:bg-gray-50">
                    <Heart size={16} />
                    Favorites
                  </button>
                  <button type="button" onClick={() => navigator.share?.({ title: event.title, url: window.location.href }) ?? navigator.clipboard?.writeText(window.location.href)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-full text-sm font-semibold hover:bg-gray-50">
                    <Share2 size={16} />
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      for (const photo of photos) {
                        const link = document.createElement("a");
                        link.href = getMediaUrl(photo.url);
                        link.download = photo.filename || `photo-${photo.id}`;
                        link.target = "_blank";
                        link.rel = "noopener";
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        try { await photosAPI.download(photo.id); } catch {}
                      }
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 text-white rounded-full text-sm font-semibold"
                    style={{ backgroundColor: "var(--brand-primary)" }}
                  >
                    <Download size={16} />
                    Download all
                  </button>
                </div>
              </div>

              {chapterOnePhotos.length > 0 && (
                <div className="mb-20">
                  <div className="text-center mb-12">
                    <div className="text-xs uppercase tracking-widest mb-6" style={{ color: "var(--brand-primary)" }}>
                      Chapter I
                    </div>
                    <p className="text-4xl md:text-5xl italic text-gray-900 max-w-4xl mx-auto leading-relaxed">
                      "{event.description || event.subtitle}"
                    </p>
                  </div>
                  {renderGalleryBlock(chapterOnePhotos)}
                </div>
              )}

              {chapterTwoPhotos.length > 0 && (
                <div className="mb-20">
                  <div className="text-center mb-12">
                    <div className="text-xs uppercase tracking-widest mb-6" style={{ color: "var(--brand-primary)" }}>
                      Chapter II
                    </div>
                    <p className="text-4xl md:text-5xl italic text-gray-900 max-w-4xl mx-auto leading-relaxed">
                      The story unfolds
                    </p>
                  </div>
                  {renderGalleryBlock(chapterTwoPhotos)}
                </div>
              )}

              {chapterThreePhotos.length > 0 && (
                <div className="mb-20">
                  <div className="text-center mb-12">
                    <div className="text-xs uppercase tracking-widest mb-6" style={{ color: "var(--brand-primary)" }}>
                      Chapter III
                    </div>
                    <p className="text-4xl md:text-5xl italic text-gray-900 max-w-4xl mx-auto leading-relaxed">
                      Forever captured
                    </p>
                  </div>
                  {renderGalleryBlock(chapterThreePhotos)}
                </div>
              )}

              {photos.length > 0 && (
                <div className="mt-20 pt-20 border-t border-gray-200">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">All Photos</h2>
                  </div>
                  {renderGalleryBlock(photos)}
                </div>
              )}
            </div>
          );
        }

        if (section.type === "info") {
          const alignClass = config.info.align === "Center" ? "text-center" : "text-left";
          return (
            <div key={section.id} className="max-w-3xl mx-auto px-6 py-16">
              <div className={`bg-gray-50 rounded-3xl p-8 ${alignClass}`}>
                <h2 className="text-2xl font-bold mb-3">{event.title}</h2>
                {config.info.showDate && (
                  <p className="text-sm text-gray-600 mb-1">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {config.info.showLocation && event.subtitle && (
                  <p className="text-sm text-gray-600 mb-1">{event.subtitle}</p>
                )}
                {config.info.showDescription && event.description && (
                  <p className="text-gray-700 mt-4">{event.description}</p>
                )}
              </div>
            </div>
          );
        }

        if (section.type === "guestbook") {
          return (
            <div key={section.id} className="py-24 bg-emerald-light/40">
              <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-12">
                  <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--brand-primary)" }}>
                    Guestbook
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold">Notes from the day</h2>
                </div>

                {guestEntries.length > 0 && (
                  <div className="space-y-4 mb-10">
                    {guestEntries.map((n) => (
                      <div key={n.id} className="bg-white rounded-3xl p-6 ring-1 ring-gray-200">
                        <p className="italic text-lg mb-3">"{n.message}"</p>
                        <div className="text-sm font-bold text-gray-500">— {n.name}</div>
                      </div>
                    ))}
                  </div>
                )}

                {config.guestbook.enabled ? (
                  <div className="bg-white rounded-[2rem] p-6 ring-1 ring-gray-200">
                    <input
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full mb-3 bg-gray-100 rounded-2xl px-4 py-3 text-sm outline-none"
                      placeholder="Your name"
                    />
                    <textarea
                      value={guestMessage}
                      onChange={(e) => setGuestMessage(e.target.value)}
                      rows={3}
                      className="w-full mb-4 bg-gray-100 rounded-2xl px-4 py-3 text-sm outline-none"
                      placeholder="Leave a note…"
                    />
                    <button
                      type="button"
                      onClick={handleSignGuestbook}
                      disabled={guestSubmitting || !guestName.trim() || !guestMessage.trim()}
                      className="text-white px-6 py-3 rounded-full font-bold transition-colors disabled:opacity-50"
                      style={{ backgroundColor: "var(--brand-primary)" }}
                    >
                      {guestSubmitting ? "Posting..." : "Sign guestbook"}
                    </button>
                    {guestFeedback && (
                      <p className="text-sm text-gray-600 mt-3">{guestFeedback}</p>
                    )}
                    {config.guestbook.requireApproval && (
                      <p className="text-xs text-gray-400 mt-2">
                        Notes are reviewed by the studio before appearing publicly.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-500">
                    Guest comments are turned off for this event.
                  </p>
                )}
              </div>
            </div>
          );
        }

        if (section.type === "contact") {
          return (
            <div key={section.id} className="py-24">
              <div className="max-w-xl mx-auto px-6">
                <div
                  className="rounded-[2.5rem] p-8 md:p-10 text-center ring-1"
                  style={{
                    backgroundColor: "var(--brand-primary)11",
                    borderColor: "var(--brand-primary)",
                  }}
                >
                  <h2 className="text-2xl font-bold mb-2">{config.contact.buttonLabel || "Book this studio"}</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Reach out via {config.contact.method.toLowerCase()} and the studio will follow up.
                  </p>
                  <div className="space-y-3 text-left">
                    <input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-white rounded-2xl px-4 py-3 text-sm outline-none ring-1 ring-gray-200"
                      placeholder="Your name"
                    />
                    {config.contact.method !== "Phone" && (
                      <input
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        type="email"
                        className="w-full bg-white rounded-2xl px-4 py-3 text-sm outline-none ring-1 ring-gray-200"
                        placeholder="Email"
                      />
                    )}
                    {config.contact.method === "Phone" && (
                      <input
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-white rounded-2xl px-4 py-3 text-sm outline-none ring-1 ring-gray-200"
                        placeholder="Phone number"
                      />
                    )}
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-white rounded-2xl px-4 py-3 text-sm outline-none ring-1 ring-gray-200"
                      placeholder="Tell them a bit about your event…"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleContactSubmit}
                    disabled={contactSubmitting || !contactName.trim()}
                    className="mt-4 text-white px-8 py-3 rounded-full font-bold transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "var(--brand-primary)" }}
                  >
                    {contactSubmitting ? "Sending..." : config.contact.buttonLabel || "Send inquiry"}
                  </button>
                  {contactFeedback && <p className="text-sm text-gray-600 mt-3">{contactFeedback}</p>}
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}

      {/* Footer */}
      <div className="bg-gray-50 py-12 mt-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600 text-sm">
          {studio?.slug && (
            <p className="mb-2">
              Photographed by{" "}
              <Link to="/studio/$slug" params={{ slug: studio.slug }} className="font-bold hover:underline" style={{ color: "var(--brand-primary)" }}>
                {studio.name}
              </Link>
            </p>
          )}
          <p>© {new Date().getFullYear()} DearMemory. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}