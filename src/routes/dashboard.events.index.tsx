import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { eventsAPI , getMediaUrl} from "@/lib/api/client";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/events/")({
  head: () => ({ meta: [{ title: "Events — DearMemory" }] }),
  component: EventsList,
});

const STATUS_COLORS: Record<string, string> = {
  Live: "bg-emerald-light text-emerald-deep",
  Draft: "bg-cream text-warm-gray",
  Scheduled: "bg-sky text-foreground",
  Archived: "bg-gray-200 text-gray-600",
};

function EventsList() {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventsAPI.list();
        setEvents(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events
  useEffect(() => {
    let filtered = events;

    if (statusFilter !== "All") {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((e) =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, statusFilter, searchTerm]);

  if (loading) {
    return (
      <AppShell title="Events" subtitle="Loading...">
        <div className="text-center py-12">Loading events...</div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Events" subtitle="Error">
        <div className="text-center py-12 text-red-600">{error}</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Events"
      subtitle="Every gallery you've created, published, and scheduled."
      action={
        <div className="flex gap-2">
          <div className="hidden md:flex items-center gap-2 bg-white ring-1 ring-border rounded-full px-4 py-2 w-72">
            <input
              className="flex-1 bg-transparent text-sm outline-none"
              placeholder="Search events…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link
            to="/dashboard/events/new"
            className="bg-emerald text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-deep"
          >
            Create Event
          </Link>
        </div>
      }
    >
      <div className="flex gap-2 mb-6 flex-wrap">
        {["All", "Live", "Draft", "Scheduled", "Archived"].map((s, i) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              statusFilter === s
                ? "bg-emerald text-white"
                : "bg-white ring-1 ring-border text-warm-gray hover:bg-cream"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-warm-gray">
          No events found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-[2rem] overflow-hidden ring-1 ring-border hover:-translate-y-1 transition-transform group"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={e.cover_image ? getMediaUrl(e.cover_image) : "/placeholder.png"}
                  alt={e.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div
                  className={`absolute top-4 left-4 ${
                    STATUS_COLORS[e.status] || "bg-gray-200"
                  } px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest`}
                >
                  {e.status}
                </div>
              </div>
              <div className="p-5">
                <div className="text-[10px] uppercase tracking-widest text-warm-gray font-bold mb-1">
                  {e.type} · {e.template}
                </div>
                <div className="font-bold text-lg">{e.title}</div>
                <div className="text-sm text-warm-gray">
                  {e.subtitle} · {new Date(e.date).toLocaleDateString()}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
                  <Stat label="Views" v={e.views.toLocaleString()} />
                  <Stat label="Visitors" v={e.visitors.toLocaleString()} />
                  <Stat label="Photos" v={e.photo_count?.toString() || "0"} />
                </div>
                <div className="flex gap-2 mt-5">
                  <Link
                    to="/dashboard/events/$id"
                    params={{ id: e.id.toString() }}
                    className="flex-1 text-center text-sm font-semibold py-2.5 rounded-full bg-cream hover:bg-emerald-light/60 transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    to="/dashboard/events/$id"
                    params={{ id: e.id.toString() }}
                    className="flex-1 text-center text-sm font-semibold py-2.5 rounded-full bg-emerald text-white hover:bg-emerald-deep"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="font-mono text-emerald text-sm">{v}</div>
      <div className="text-[10px] uppercase tracking-widest text-warm-gray">{label}</div>
    </div>
  );
}