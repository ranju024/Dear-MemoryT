import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { eventsAPI, photosAPI, analyticsAPI , getMediaUrl} from "@/lib/api/client";
import { ArrowLeft, Upload, LayoutGrid } from "lucide-react";
import { ImageLightbox } from "@/components/ImageLightbox";
import {
  EventDesignSidebar,
  parseDesignConfig,
  DEFAULT_DESIGN_CONFIG,
  type DesignConfig,
} from "@/components/app/EventDesignSidebar";

export const Route = createFileRoute("/dashboard/events/$id")({
  head: () => ({ meta: [{ title: "Event Details — DearMemory" }] }),
  component: EventDetail,
});

function EventDetail() {
  const { id } = useParams({ from: "/dashboard/events/$id" });
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [view, setView] = useState<"details" | "design">("details");
  const [designConfig, setDesignConfig] = useState<DesignConfig>(DEFAULT_DESIGN_CONFIG);
  const [savingDesign, setSavingDesign] = useState(false);
  const [designSaved, setDesignSaved] = useState(false);

  const eventId = parseInt(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventData, photosData, perfData] = await Promise.all([
          eventsAPI.get(eventId),
          photosAPI.list(eventId),
          analyticsAPI.eventPerformance(eventId),
        ]);

        setEvent(eventData);
        setPhotos(photosData || []);
        setPerformance(perfData);
        setEditData(eventData);
        setDesignConfig(parseDesignConfig(eventData.design_config));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      const updated = await eventsAPI.update(eventId, editData);
      setEvent(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      console.log("Uploading to event:", eventId);
      const newPhoto = await photosAPI.upload(eventId, file);
      console.log("Upload response:", newPhoto);
      setPhotos([...photos, newPhoto]);

      // Refetch event to update stats
      const updatedEvent = await eventsAPI.get(eventId);
      setEvent(updatedEvent);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleFavorite = async (photoId: number) => {
    try {
      const photo = photos.find(p => p.id === photoId);
      const updated = photo?.favorites > 0 
        ? await photosAPI.unfavorite(photoId)
        : await photosAPI.favorite(photoId);

      setPhotos(photos.map((p) => (p.id === photoId ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to favorite photo");
    }
  };

  // In the photos grid section:
  {photos.length === 0 ? (
    <p className="text-warm-gray text-center py-8">No photos yet. Upload your first photo!</p>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="aspect-square rounded-lg overflow-hidden group relative cursor-pointer"
          onClick={() => {
            setLightboxIndex(index);
            setLightboxOpen(true);
          }}
        >
          <img
            src={getMediaUrl(photo.url)}
            alt={photo.filename}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePhoto(photo.id);
            }}
            className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}

  {lightboxOpen && (
    <ImageLightbox
      images={photos}
      initialIndex={lightboxIndex}
      onClose={() => setLightboxOpen(false)}
      onFavorite={handleFavorite}
    />
  )}

  const handleDeletePhoto = async (photoId: number) => {
    if (!window.confirm("Delete this photo?")) return;
    
    try {
      await photosAPI.delete(photoId);
      setPhotos(photos.filter(p => p.id !== photoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo");
    }
  };

  const handleSaveDesign = async () => {
    setSavingDesign(true);
    setDesignSaved(false);
    try {
      const updated = await eventsAPI.update(eventId, {
        design_config: JSON.stringify(designConfig),
      });
      setEvent(updated);
      setDesignSaved(true);
      setTimeout(() => setDesignSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save page design");
    } finally {
      setSavingDesign(false);
    }
  };

  const handlePublish = async () => {
    try {
      const updated = await eventsAPI.publish(eventId);
      setEvent(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish event");
    }
  };

  if (loading) {
    return (
      <AppShell title="Event" subtitle="Loading...">
        <div className="text-center py-12">Loading event...</div>
      </AppShell>
    );
  }

  if (error || !event) {
    return (
      <AppShell title="Event" subtitle="Error">
        <div className="text-center py-12 text-red-600">{error || "Event not found"}</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={event.title}
      subtitle={event.subtitle || "Event details and analytics"}
      hideSidebar={view === "design"}
      action={
        <div className="flex gap-2">
          <button
            onClick={() => navigate({ to: "/dashboard/events" })}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:bg-cream"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          {event.status !== "Live" && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-emerald text-white rounded-full font-semibold hover:bg-emerald-deep"
            >
              Publish
            </button>
          )}
        </div>
      }
    >
      {view === "design" ? (
        <div className="-mx-7 md:-mx-9 -my-8 flex" style={{ minHeight: "calc(100vh - 220px)" }}>
          <aside className="w-[300px] shrink-0 border-r border-[#e8e4de] flex flex-col bg-white">
            <div className="px-4 py-4 border-b border-[#e8e4de]">
              <button
                onClick={() => setView("details")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-warm-gray hover:text-emerald"
              >
                <ArrowLeft size={14} />
                Back to details
              </button>
            </div>
            <EventDesignSidebar config={designConfig} onChange={setDesignConfig} variant="flush" />
            <div className="p-3 border-t border-[#e8e4de]">
              <button
                onClick={handleSaveDesign}
                disabled={savingDesign}
                className="w-full px-4 py-2 bg-emerald text-white rounded-xl text-sm font-semibold hover:bg-emerald-deep disabled:opacity-60"
              >
                {savingDesign ? "Saving..." : designSaved ? "Saved!" : "Save design"}
              </button>
            </div>
          </aside>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f7f5f1]">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <EventDesignPreview event={event} photos={photos} config={designConfig} />
          </div>
        </div>
      ) : (
      <div className="space-y-8">
        {error && (
          <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => setView("design")}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-cream rounded-full text-xs font-semibold hover:bg-cream/70"
          >
            <LayoutGrid size={14} />
            Customize page design
          </button>
        </div>
        {/* Event Details Section */}
        <section className="bg-white rounded-2xl ring-1 ring-border p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Event Details</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-emerald font-semibold hover:underline"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => handleEditChange("title", e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Subtitle</label>
                <input
                  type="text"
                  value={editData.subtitle || ""}
                  onChange={(e) => handleEditChange("subtitle", e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={editData.description || ""}
                  onChange={(e) => handleEditChange("description", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
                />
              </div>

              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-emerald text-white rounded-lg font-semibold hover:bg-emerald-deep"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-warm-gray">Type</label>
                <p className="text-lg">{event.type}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-warm-gray">Date</label>
                <p className="text-lg">{new Date(event.date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-warm-gray">Status</label>
                <p className="text-lg font-semibold text-emerald">{event.status}</p>
              </div>
              {event.description && (
                <div>
                  <label className="text-sm font-semibold text-warm-gray">Description</label>
                  <p className="text-lg">{event.description}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Performance Stats */}
        {performance && (
          <section className="bg-white rounded-2xl ring-1 ring-border p-6">
            <h2 className="text-2xl font-bold mb-6">Performance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat label="Views" value={performance.views?.toLocaleString() || "0"} />
              <Stat label="Visitors" value={performance.visitors?.toLocaleString() || "0"} />
              <Stat label="Photos" value={performance.total_photos?.toString() || "0"} />
              <Stat label="Favorites" value={performance.total_favorites?.toString() || "0"} />
            </div>
          </section>
        )}

        {/* Photos Section */}
        <section className="bg-white rounded-2xl ring-1 ring-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Photos ({photos.length})</h2>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald text-white rounded-full cursor-pointer hover:bg-emerald-deep">
              <Upload size={16} />
              Upload
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {uploading && <p className="text-sm text-warm-gray mb-4">Uploading...</p>}

          {photos.length === 0 ? (
            <p className="text-warm-gray text-center py-8">No photos yet. Upload your first photo!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden group relative">
                  <img
                    // src={photo.url.startsWith('http') ? photo.url : getMediaUrl(photo.url)}
                    src={getMediaUrl(photo.url)}                    
                    alt={photo.filename}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                  <button 
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >X</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      )}
    </AppShell>
  );
}

function EventDesignPreview({
  event,
  photos,
  config,
}: {
  event: any;
  photos: any[];
  config: DesignConfig;
}) {
  const visibleSections = config.sections.filter((s) => s.visible);

  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl ring-1 ring-border p-6 space-y-5">
      <div className="text-[10px] font-bold uppercase tracking-widest text-warm-gray">
        Live preview
      </div>
      {visibleSections.length === 0 && (
        <p className="text-sm text-warm-gray text-center py-12">
          No sections are visible — toggle at least one on in the sidebar.
        </p>
      )}
      {visibleSections.map((section) => {
        if (section.type === "cover") {
          const heightPx = { Small: 120, Medium: 200, Large: 320 }[config.cover.height];
          const justify = { Left: "flex-start", Center: "center", Right: "flex-end" }[
            config.cover.titleAlign
          ];
          return (
            <div
              key={section.id}
              className="relative rounded-xl bg-cream ring-1 ring-border overflow-hidden flex items-end"
              style={{ height: heightPx }}
            >
              {event?.cover_image && (
                <img
                  src={getMediaUrl(event.cover_image)}
                  alt="Cover"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div
                className="absolute inset-0"
                style={{ background: `rgba(0,0,0,${config.cover.overlay / 100})` }}
              />
              <div
                className="relative w-full flex p-4"
                style={{ justifyContent: justify }}
              >
                <p className="text-white font-bold text-lg drop-shadow">
                  {event?.title || "Event title"}
                </p>
              </div>
            </div>
          );
        }
        if (section.type === "gallery") {
          const cols = Math.min(config.gallery.columns, 6);
          return (
            <div key={section.id}>
              <div className="text-xs font-semibold text-warm-gray mb-2">
                Gallery — {config.gallery.layout} · {config.gallery.columns} cols
              </div>
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gap: `${config.gallery.spacing * 2}px`,
                }}
              >
                {(photos.length ? photos.slice(0, cols * 2) : Array.from({ length: cols * 2 })).map(
                  (photo: any, i: number) => (
                    <div
                      key={photo?.id ?? i}
                      className="aspect-square bg-cream ring-1 ring-border overflow-hidden"
                      style={{ borderRadius: `${config.gallery.radius}px` }}
                    >
                      {photo?.url && (
                        <img
                          src={getMediaUrl(photo.url)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          );
        }
        if (section.type === "info") {
          const alignClass = config.info.align === "Center" ? "text-center" : "text-left";
          return (
            <div key={section.id} className={`rounded-xl bg-cream ring-1 ring-border p-4 ${alignClass}`}>
              <p className="text-sm font-semibold">{event?.title || "Event title"}</p>
              {config.info.showDate && (
                <p className="text-xs text-warm-gray mt-1">
                  {event?.date ? new Date(event.date).toLocaleDateString() : "Event date"}
                </p>
              )}
              {config.info.showLocation && (
                <p className="text-xs text-warm-gray">{event?.location || "Event location"}</p>
              )}
              {config.info.showDescription && (
                <p className="text-xs text-warm-gray mt-1">
                  {event?.description || "Event description goes here."}
                </p>
              )}
            </div>
          );
        }
        if (section.type === "guestbook") {
          return (
            <div
              key={section.id}
              className="rounded-xl bg-cream ring-1 ring-border p-4 text-xs text-warm-gray"
            >
              {config.guestbook.enabled ? (
                <>
                  Guestbook / comments section
                  {config.guestbook.requireApproval && (
                    <span className="block mt-1 text-[10px] text-warm-gray/70">
                      Comments require approval before showing
                    </span>
                  )}
                </>
              ) : (
                "Guest comments are turned off for this event"
              )}
            </div>
          );
        }
        if (section.type === "contact") {
          return (
            <div
              key={section.id}
              className="rounded-2xl bg-emerald/10 ring-1 ring-emerald/30 p-4 text-center"
            >
              <button className="px-5 py-2 bg-emerald text-white rounded-full text-xs font-semibold">
                {config.contact.buttonLabel || "Book this studio"}
              </button>
              <p className="text-[10px] text-warm-gray mt-2">via {config.contact.method}</p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-emerald">{value}</p>
      <p className="text-sm text-warm-gray mt-1">{label}</p>
    </div>
  );
}