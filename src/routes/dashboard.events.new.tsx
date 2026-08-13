import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { eventsAPI } from "@/lib/api/client";

export const Route = createFileRoute("/dashboard/events/new")({
  head: () => ({ meta: [{ title: "Create Event — DearMemory" }] }),
  component: CreateEvent,
});

function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    subtitle: "",
    description: "",
    type: "Wedding",
    date: new Date().toISOString().split("T")[0],
    template: "Modern Elegance",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const eventData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      const response = await eventsAPI.create(eventData);
      if (response.id) {
        navigate({ to: `/dashboard/events/${response.id}` });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Create Event" subtitle="Start a new gallery experience.">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl ring-1 ring-border p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Event Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="wedding-june-2024"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="John & Jane Wedding"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Subtitle</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="June 14, 2024"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
              >
                <option>Wedding</option>
                <option>Graduation</option>
                <option>Concert</option>
                <option>Corporate</option>
                <option>Birthday</option>
                <option>Sports</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Template</label>
            <select
              name="template"
              value={formData.template}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald"
            >
              <option>Modern Elegance</option>
              <option>Classic Gallery</option>
              <option>Minimalist</option>
              <option>Bold & Vibrant</option>
            </select>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard/events" })}
              className="flex-1 px-6 py-3 border border-border rounded-lg font-semibold hover:bg-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-emerald text-white rounded-lg font-semibold hover:bg-emerald-deep disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}