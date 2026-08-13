import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { albumsAPI, photosAPI , getMediaUrl} from "@/lib/api/client";
import { ImageLightbox } from "@/components/ImageLightbox";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/albums/$id")({
  head: () => ({ meta: [{ title: "Album — DearMemory" }] }),
  component: AlbumDetail,
});

function AlbumDetail() {
  const { id } = useParams({ from: "/dashboard/albums/$id" });
  const navigate = useNavigate();
  const [album, setAlbum] = useState<any>(null);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const [availablePhotos, setAvailablePhotos] = useState<any[]>([]);

  const albumId = parseInt(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const albumData = await albumsAPI.get(albumId);
        setAlbum(albumData);
        setEditData(albumData);
        setAllPhotos(albumData.photos || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load album");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [albumId]);

  const handleSaveEdit = async () => {
    try {
      const updated = await albumsAPI.update(albumId, editData);
      setAlbum(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update album");
    }
  };

  const handleAddPhoto = async () => {
    try {
      const eventPhotos = await photosAPI.list(album.event_id);
      
      if (!eventPhotos || eventPhotos.length === 0) {
        setError("no_photos_available");
        return;
      }

      setAvailablePhotos(eventPhotos);
      setShowPhotoSelector(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos");
    }
  };

  const handleSelectPhoto = async (photoId: number) => {
    try {
      await albumsAPI.addPhoto(albumId, photoId);
      const updated = await albumsAPI.get(albumId);
      setAlbum(updated);
      setAllPhotos(updated.photos || []);
      setShowPhotoSelector(false);
      setAvailablePhotos([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add photo");
    }
  };

  const handleRemovePhoto = async (photoId: number) => {
    if (!window.confirm("Remove photo from album?")) return;

    try {
      await albumsAPI.removePhoto(albumId, photoId);
      setAllPhotos(allPhotos.filter((p) => p.id !== photoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove photo");
    }
  };

  if (loading) {
    return (
      <AppShell title="Album" subtitle="Loading...">
        <div className="text-center py-12">Loading album...</div>
      </AppShell>
    );
  }

  if (!album) {
    return (
      <AppShell title="Album" subtitle="Error">
        <div className="text-center py-12 text-red-600">Album not found</div>
      </AppShell>
    );
  }

  // Photo selector view
  if (showPhotoSelector) {
    return (
      <AppShell title="Select Photos" subtitle="Choose photos to add to this album">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setShowPhotoSelector(false)}
            className="mb-6 px-4 py-2 border border-border rounded-lg hover:bg-cream"
          >
            ← Back
          </button>

          {availablePhotos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-warm-gray mb-6">No photos available in this event.</p>
              <Link
                to="/dashboard/events/$id"
                params={{ id: album.event_id.toString() }}
                className="px-6 py-3 bg-emerald text-white rounded-lg font-semibold hover:bg-emerald-deep"
              >
                Upload Photos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {availablePhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => handleSelectPhoto(photo.id)}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                >
                  <img
                    src={getMediaUrl(photo.url)}
                    alt={photo.filename}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <span className="text-white font-semibold opacity-0 group-hover:opacity-100">
                      + Add
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  // Album detail view
  return (
    <AppShell
      title={album.name}
      subtitle={album.description || "Album details"}
      action={
        <button
          onClick={() => navigate({ to: "/dashboard/albums" })}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:bg-cream"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center justify-between">
          <span>
            {error === "no_photos_available" 
              ? "No photos available in this event." 
              : error}
          </span>
          {error === "no_photos_available" && (
            <Link
              to="/dashboard/events/$id"
              params={{ id: album.event_id.toString() }}
              className="ml-4 px-4 py-2 bg-emerald text-white rounded hover:bg-emerald-deep font-semibold whitespace-nowrap"
            >
              Upload Photos
            </Link>
          )}
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox
          images={allPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onFavorite={() => {}}
        />
      )}

      {/* Album Details Section */}
      <section className="bg-white rounded-2xl ring-1 ring-border p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Album Details</h2>
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
              <label className="block text-sm font-semibold mb-2">Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={editData.description || ""}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
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
              <label className="text-sm font-semibold text-warm-gray">Name</label>
              <p className="text-lg">{album.name}</p>
            </div>
            {album.description && (
              <div>
                <label className="text-sm font-semibold text-warm-gray">Description</label>
                <p className="text-lg">{album.description}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Photos Section */}
      <section className="bg-white rounded-2xl ring-1 ring-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Photos ({allPhotos.length})</h2>
          <button
            onClick={handleAddPhoto}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald text-white rounded-full hover:bg-emerald-deep"
          >
            <Plus size={16} />
            Add Photo
          </button>
        </div>

        {allPhotos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-warm-gray mb-6">No photos in this album yet.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAddPhoto}
                className="px-6 py-3 bg-emerald text-white rounded-lg font-semibold hover:bg-emerald-deep"
              >
                Add Photos from Event
              </button>
              <Link
                to="/dashboard/events/$id"
                params={{ id: album.event_id.toString() }}
                className="px-6 py-3 border border-emerald text-emerald rounded-lg font-semibold hover:bg-emerald-light"
              >
                Upload New Photos
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {allPhotos.map((photo, index) => (
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(photo.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}