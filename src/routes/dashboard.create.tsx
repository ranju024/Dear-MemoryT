// import { createFileRoute } from "@tanstack/react-router";
// import { AppShell } from "@/components/app/AppShell";
// import { EVENTS } from "@/lib/mock/data";

// export const Route = createFileRoute("/dashboard/create")({
//   head: () => ({ meta: [{ title: "Create — DearMemory" }] }),
//   component: CreateEvents,
// });

// function CreateEvents() {
//   return (
//     <AppShell
//       title="Pick the Album Template You Love"
//       action={
//         <div className="flex gap-2">
//           <div className="hidden md:flex items-center gap-2 bg-white ring-1 ring-border rounded-full px-4 py-2 w-72">
//             <input
//               className="flex-1 bg-transparent text-sm outline-none"
//               placeholder="Search events…"
//             />
//           </div>
//         </div>
//       }
//     >
//       <div className="flex gap-2 mb-6 flex-wrap">
//         {["All", "Wedding", "Graduation", "College Fest", "Corporate Event", "Conference", "Concert", "Anniversary", "Party"].map((s, i) => (
//           <button
//             key={s}
//             className={`px-4 py-2 rounded-full text-sm font-semibold ${i === 0 ? "bg-emerald text-white" : "bg-white ring-1 ring-border text-warm-gray hover:bg-cream"}`}
//           >
//             {s}
//           </button>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {EVENTS.map((e) => (
//           <div
//             key={e.id}
//             className="rounded-lg overflow-hidden ring-1 ring-border group cursor-pointer"
//           >
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <img
//                 src={e.cover}
//                 alt={e.title}
//                 className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:blur-sm"
//               />
//               <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 <a
//                   href={`/event/${e.slug}`}
//                   className="px-5 py-2.5 rounded-full bg-white/90 text-warm-gray text-sm font-semibold hover:bg-white transition-colors"
//                 >
//                   View
//                 </a>
//                 <a
//                   href="/album-editor"
//                   className="px-5 py-2.5 rounded-full bg-emerald text-white text-sm font-semibold hover:bg-emerald-deep transition-colors"
//                 >
//                   Edit
//                 </a>
//               </div>
//             </div>
//             <div className="p-4 bg-white">
//               <div className="font-bold text-lg">{e.title}</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </AppShell>
//   );
// }


import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { eventsAPI , getMediaUrl} from "@/lib/api/client";

export const Route = createFileRoute("/dashboard/create")({
  head: () => ({ meta: [{ title: "Create — DearMemory" }] }),
  component: CreateEvents,
});

function CreateEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const eventTypes = ["All", "Wedding", "Graduation", "Concert", "Corporate", "Birthday", "Sports"];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventsAPI.list();
        setEvents(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    // Filter by type
    if (activeType !== "All") {
      filtered = filtered.filter((e) => e.type === activeType);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter((e) =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, activeType, searchTerm]);

  if (loading) {
    return (
      <AppShell title="Pick the Album Template You Love">
        <div className="text-center py-12">Loading templates...</div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Pick the Album Template You Love">
        <div className="text-center py-12 text-red-600">{error}</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Pick the Album Template You Love"
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
        </div>
      }
    >
      <div className="flex gap-2 mb-6 flex-wrap">
        {eventTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              activeType === type
                ? "bg-emerald text-white"
                : "bg-white ring-1 ring-border text-warm-gray hover:bg-cream"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-warm-gray">
          No events found. Create an event first to start building albums.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-lg overflow-hidden ring-1 ring-border group cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-200">
                {event.cover_image ? (
                  <img
                    src={getMediaUrl(event.cover_image)}
                    alt={event.title}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:blur-sm"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No cover image
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => navigate({ to: "/event/$slug", params: { slug: event.slug } })}
                    className="px-5 py-2.5 rounded-full bg-white/90 text-warm-gray text-sm font-semibold hover:bg-white transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate({ to: "/dashboard/albums/new" })}
                    className="px-5 py-2.5 rounded-full bg-emerald text-white text-sm font-semibold hover:bg-emerald-deep transition-colors"
                  >
                    Create Album
                  </button>
                </div>
              </div>
              <div className="p-4 bg-white">
                <div className="font-bold text-lg">{event.title}</div>
                <div className="text-sm text-warm-gray">{event.type}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}