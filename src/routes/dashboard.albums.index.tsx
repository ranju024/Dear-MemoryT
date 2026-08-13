import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { albumsAPI, eventsAPI , getMediaUrl} from "@/lib/api/client";

export const Route = createFileRoute("/dashboard/albums/")({
  head: () => ({ meta: [{ title: "Albums — DearMemory" }] }),
  component: Albums,
});

function Albums() {
  const [events, setEvents] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all events
        const eventsData = await eventsAPI.list();
        setEvents(eventsData || []);

        // Fetch albums from all events
        const allAlbums: any[] = [];
        if (eventsData && eventsData.length > 0) {
          for (const event of eventsData) {
            const albumsList = await albumsAPI.list(event.id);
            if (albumsList) {
              const albumsWithPhotos = await Promise.all(
                albumsList.map(async (a: any) => {
                  const fullAlbum = await albumsAPI.get(a.id);
                  return { ...fullAlbum, event_title: event.title, event_id: event.id };
                })
              );
              allAlbums.push(...albumsWithPhotos);
            }
          }
        }

        setAlbums(allAlbums);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load albums");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AppShell title="Albums" subtitle="Loading...">
        <div className="text-center py-12">Loading albums...</div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Albums" subtitle="Error">
        <div className="text-center py-12 text-red-600">{error}</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Albums"
      subtitle="Story-driven, magazine-quality album design."
      action={
        <Link
          to="/dashboard/albums/new"
          className="bg-emerald text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-deep"
        >
          + New album
        </Link>
      }
    >
      {albums.length === 0 ? (
        <div className="text-center py-12 text-warm-gray">
          No albums yet. Create one to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {albums.map((album) => (
            <Link
              key={album.id}
              to="/dashboard/albums/$id"
              params={{ id: album.id.toString() }}
              className="bg-white rounded-[2rem] overflow-hidden ring-1 ring-border hover:-translate-y-1 transition-transform group"
            >
              <div className="aspect-[4/3] overflow-hidden bg-gray-200">
                {album.photos && album.photos.length > 0 ? (
                  <img
                    src={getMediaUrl(album.photos[0].url)}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No photos
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="font-bold mb-1">{album.name}</div>
                <div className="text-sm text-warm-gray">
                  {album.photo_count} photos · {album.event_title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-emerald-light/50 rounded-[2.5rem] p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Magazine, collage, timeline & more</h2>
        <p className="text-warm-gray max-w-md mx-auto mb-6">Auto layout suggestions, full-width hero photos, chapter sections — all built in.</p>
        <Link to="/dashboard/builder" className="inline-block bg-emerald text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-deep">Browse layouts</Link>
      </div>
    </AppShell>
  );
}