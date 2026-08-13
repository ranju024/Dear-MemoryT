import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { eventsAPI, photosAPI, albumsAPI , getMediaUrl} from "@/lib/api/client";
import { ImageLightbox } from "@/components/ImageLightbox";
import { Trash2, X } from "lucide-react";

export const Route = createFileRoute("/dashboard/media")({
  head: () => ({ meta: [{ title: "Media Library — DearMemory" }] }),
  component: Media,
});

function Media() {
  const [events, setEvents] = useState<any[]>([]);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState("all");
  const [activeEvent, setActiveEvent] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const eventsData = await eventsAPI.list();
        setEvents(eventsData || []);
        if (eventsData && eventsData.length > 0 && !selectedEventId) {
          setSelectedEventId(eventsData[0].id);
        }

        const allPhotosData: any[] = [];
        if (eventsData && eventsData.length > 0) {
          for (const event of eventsData) {
            const photos = await photosAPI.list(event.id);
            if (photos) {
              allPhotosData.push(
                ...photos.map((p: any) => ({ ...p, event_title: event.title, event_id: event.id }))
              );
            }
          }
        }

        setAllPhotos(allPhotosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load media");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = allPhotos;

    if (activeCollection === "favorites") {
      filtered = filtered.filter((p) => p.favorites > 0);
    } else if (activeCollection === "recent") {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    if (activeEvent) {
      filtered = filtered.filter((p) => p.event_id === activeEvent);
    }

    setFilteredPhotos(filtered);
  }, [allPhotos, activeCollection, activeEvent]);

  const stats = {
    total: allPhotos.length,
    favorites: allPhotos.filter((p) => p.favorites > 0).length,
    recent: allPhotos.filter(
      (p) =>
        new Date(p.created_at).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length,
    totalFavorites: allPhotos.reduce((sum, p) => sum + p.favorites, 0),
    totalDownloads: allPhotos.reduce((sum, p) => sum + p.downloads, 0),
  };

  const handleFavorite = async (photoId: number) => {
    try {
      const photo = allPhotos.find(p => p.id === photoId);
      const updated = photo?.favorites > 0 
        ? await photosAPI.unfavorite(photoId)
        : await photosAPI.favorite(photoId);
      
      setAllPhotos(allPhotos.map((p) => (p.id === photoId ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to favorite photo");
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!window.confirm("Delete this photo?")) return;

    try {
      await photosAPI.delete(photoId);
      setAllPhotos(allPhotos.filter((p) => p.id !== photoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo");
    }
  };

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEventId) return;

    // Check file type before uploading
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError(`File type not supported. Allowed: JPEG, PNG, WebP, GIF`);
      return;
    }

    setUploading(true);
    setError(null);

    setUploading(true);
    try {
      const newPhoto = await photosAPI.upload(selectedEventId, file);
      setAllPhotos([...allPhotos, { ...newPhoto, event_title: events.find(ev => ev.id === selectedEventId)?.title }]);
      setUploadModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName || !selectedEventId) {
      setError("Please enter folder name and select an event");
      return;
    }

    setCreatingFolder(true);
    try {
      const newAlbum = await albumsAPI.create(selectedEventId, {
        name: folderName,
        slug: folderName.toLowerCase().replace(/\s+/g, "-"),
        description: "",
      });
      
      setFolderName("");
      setFolderModalOpen(false);
      setError(null);
      // Optionally refresh or show success
      alert(`Folder "${folderName}" created successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
    } finally {
      setCreatingFolder(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Media Library" subtitle="Loading...">
        <div className="text-center py-12">Loading media library...</div>
      </AppShell>
    );
  }

  if (error && !uploadModalOpen && !folderModalOpen) {
    return (
      <AppShell title="Media Library" subtitle="Error">
        <div className="text-center py-12 text-red-600">{error}</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Media Library"
      subtitle={`${stats.total.toLocaleString()} photos across ${events.length} events`}
      action={
        <div className="flex gap-2">
          <button
            onClick={() => setFolderModalOpen(true)}
            className="bg-white ring-1 ring-border px-4 py-2 rounded-full text-sm font-semibold hover:bg-cream"
          >
            + Folder
          </button>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="bg-emerald text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-deep"
          >
            ↑ Upload
          </button>
        </div>
      }
    >
      {lightboxOpen && (
        <ImageLightbox
          images={filteredPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onFavorite={handleFavorite}
        />
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl ring-1 ring-border p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Upload Photos</h2>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-2 hover:bg-cream rounded"
              >
                <X size={24} />
              </button>
            </div>

            {error && uploadModalOpen && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Select Event</label>
                <select
                  value={selectedEventId || ""}
                  onChange={(e) => setSelectedEventId(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
                >
                  <option value="">Choose an event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Choose Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading || !selectedEventId}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>

              {uploading && <p className="text-sm text-warm-gray">Uploading...</p>}

              <button
                onClick={() => setUploadModalOpen(false)}
                className="w-full px-6 py-2 border border-border rounded-lg font-semibold hover:bg-cream transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {folderModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl ring-1 ring-border p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create Album</h2>
              <button
                onClick={() => setFolderModalOpen(false)}
                className="p-2 hover:bg-cream rounded"
              >
                <X size={24} />
              </button>
            </div>

            {error && folderModalOpen && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Select Event</label>
                <select
                  value={selectedEventId || ""}
                  onChange={(e) => setSelectedEventId(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
                >
                  <option value="">Choose an event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Album Name</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g., Ceremony Moments"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
                />
              </div>

              <p className="text-sm text-warm-gray">This album will appear in your Albums section where you can organize and manage photos.</p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setFolderModalOpen(false)}
                  className="flex-1 px-6 py-2 border border-border rounded-lg font-semibold hover:bg-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={creatingFolder || !folderName || !selectedEventId}
                  className="flex-1 px-6 py-2 bg-emerald text-white rounded-lg font-semibold hover:bg-emerald-deep disabled:opacity-50 transition-colors"
                >
                  {creatingFolder ? "Creating..." : "Create Album"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 bg-white rounded-[1.5rem] ring-1 ring-border p-5 h-fit">
          <div className="font-bold text-sm mb-3">Collections</div>
          <div className="space-y-1 text-sm">
            {[
              { id: "all", label: "All photos", count: stats.total },
              { id: "recent", label: "Recent uploads", count: stats.recent },
              { id: "favorites", label: "Favorites", count: stats.favorites },
            ].map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setActiveCollection(c.id);
                  setActiveEvent(null);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer ${
                  activeCollection === c.id && activeEvent === null
                    ? "bg-emerald-light text-emerald-deep font-semibold"
                    : "hover:bg-cream"
                }`}
              >
                <span>{c.label}</span>
                <span className="text-xs text-warm-gray font-mono">
                  {c.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="font-bold text-sm mt-6 mb-3">By event</div>
          <div className="space-y-1 text-sm">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => {
                  setActiveEvent(event.id);
                  setActiveCollection("all");
                }}
                className={`px-3 py-2 rounded-xl cursor-pointer ${
                  activeEvent === event.id
                    ? "bg-emerald-light text-emerald-deep font-semibold"
                    : "hover:bg-cream"
                }`}
              >
                {event.title}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-xs font-semibold text-warm-gray mb-3">STATS</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Favorites</span>
                <span className="font-mono font-semibold">
                  {stats.totalFavorites}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Downloads</span>
                <span className="font-mono font-semibold">
                  {stats.totalDownloads}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Gallery */}
        <div className="col-span-12 lg:col-span-9">
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12 text-warm-gray">No photos found</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="aspect-square rounded-xl overflow-hidden group relative cursor-pointer"
                  onClick={() => handlePhotoClick(index)}
                >
                  <img
                    src={getMediaUrl(photo.url)}
                    alt={photo.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(photo.id);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>

                  {photo.favorites > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 text-white text-xs p-1 text-center">
                      ❤️ {photo.favorites}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}