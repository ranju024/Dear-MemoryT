import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { albumsAPI, eventsAPI } from "@/lib/api/client";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/dashboard/albums/new")({
  head: () => ({ meta: [{ title: "Create Album — DearMemory" }] }),
  component: CreateAlbum,
});

function CreateAlbum() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    event_id: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsAPI.list();
        setEvents(data || []);
        if (data && data.length > 0) {
          setFormData((prev) => ({ ...prev, event_id: data[0].id.toString() }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const eventId = parseInt(formData.event_id);
      const response = await albumsAPI.create(eventId, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
      });

      if (response.id) {
        navigate({ to: "/dashboard/albums/$id", params: { id: response.id.toString() } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create album");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Create Album" subtitle="Loading...">
        <div className="text-center py-12">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Create Album" subtitle="Start a new album.">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl ring-1 ring-border p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Event</label>
            <select
              name="event_id"
              value={formData.event_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
              required
            >
              <option value="">Select an event</option>
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
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Ceremony Moments"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="ceremony-moments"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this album..."
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard/albums" })}
              className="flex-1 px-6 py-3 border border-border rounded-lg font-semibold hover:bg-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 px-6 py-3 bg-emerald text-white rounded-lg font-semibold hover:bg-emerald-deep disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating..." : "Create Album"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}