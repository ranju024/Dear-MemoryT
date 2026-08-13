import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { studioAPI, getUserIdFromToken , getMediaUrl} from "@/lib/api/client";

export const Route = createFileRoute("/dashboard/portfolio")({
  head: () => ({ meta: [{ title: "Studio Portfolio — DearMemory" }] }),
  component: Portfolio,
});

const DEFAULT_SECTIONS = ["Hero banner", "About", "Our story", "Meet the team", "Portfolio showcase", "Featured events", "Packages", "Reviews", "Awards", "Contact"];

function Portfolio() {
  const [studio, setStudio] = useState<any>(null);
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    const fetchStudio = async () => {
      try {
        setLoading(true);
        const data = await studioAPI.getMe();
        setStudio(data);
        setEditData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load studio profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudio();
  }, []);

  const handleSaveChanges = async () => {
    if (!studio) return;

    setSaving(true);
    try {
      const updated = await studioAPI.update(editData);
      setStudio(updated);
      setEditData(updated);
      alert("Changes saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = () => {
    const newSection = prompt("Enter section name:");
    if (newSection && !sections.includes(newSection)) {
      setSections([...sections, newSection]);
    }
  };

  if (loading) {
    return (
      <AppShell title="Studio Portfolio" subtitle="Loading...">
        <div className="text-center py-12">Loading studio profile...</div>
      </AppShell>
    );
  }

  // if (error || !studio) {
  //   return (
  //     <AppShell title="Studio Portfolio" subtitle="Error">
  //       <div className="text-center py-12 text-red-600">{error || "Studio not found"}</div>
  //     </AppShell>
  //   );
  // }
  if (error || !studio) {
    return (
      <AppShell title="Studio Portfolio" subtitle="Error">
        <div className="text-center py-12">
          <p className="text-red-600 mb-6">{error || "Studio profile not found"}</p>
          <button
            onClick={async () => {
              try {
                const newStudio = await studioAPI.create({
                  name: "My Studio",
                  tagline: "Professional photography",
                });
                setStudio(newStudio);
                setEditData(newStudio);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to create studio profile");
                console.error(err);
              }
            }}
            className="px-6 py-2 bg-emerald text-white rounded-lg font-semibold hover:bg-emerald-deep"
          >
            Create Studio Profile
          </button>
        </div>
      </AppShell>
    );
  }

  const studioSlug = studio.slug || "";
  const studioDomain = studio.domain || "goldenhour.dearmemory.com";

  return (
    <AppShell
      title="Studio Portfolio"
      subtitle={studioDomain}
      action={
        <div className="flex gap-2">
          
            <a href={`/studio/${studioSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white ring-1 ring-border px-4 py-2 rounded-full text-sm font-semibold hover:bg-cream"
          >
            View public
          </a>
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="bg-emerald text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-emerald-deep disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3 bg-white rounded-[1.5rem] ring-1 ring-border p-5 h-fit">
          <div className="font-bold text-sm mb-3">Sections</div>
          <div className="space-y-1 text-sm">
            {sections.map((s, i) => (
              <div
                key={s}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer ${
                  i === 0 ? "bg-emerald-light text-emerald-deep font-semibold" : "hover:bg-cream"
                }`}
              >
                <span className="text-warm-gray text-xs">⋮⋮</span>
                {s}
              </div>
            ))}
          </div>
          <button
            onClick={handleAddSection}
            className="mt-4 w-full text-sm font-semibold py-2 rounded-xl border border-dashed border-warm-gray/30 text-warm-gray hover:bg-cream transition-colors"
          >
            + Add section
          </button>
        </aside>

        <div className="col-span-12 lg:col-span-9 bg-cream rounded-[1.5rem] p-6">
          <div className="bg-white rounded-[1.5rem] overflow-hidden shadow ring-1 ring-border">
            {/* Hero Banner */}
            <div className="relative aspect-[16/8]">
              {studio.cover_image ? (
                <img
                  src={getMediaUrl(studio.cover_image)}
                  className="w-full h-full object-cover"
                  alt={studio.name}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                  No cover image
                </div>
              )}
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-end p-8 text-white">
                <div>
                  <h2 className="text-3xl font-bold">{studio.name}</h2>
                  <p className="font-serif italic text-lg opacity-90">{studio.tagline}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            {studio.stats && studio.stats.length > 0 && (
              <div className="p-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-center border-b border-border">
                {studio.stats.map((s: any) => (
                  <div key={s.label}>
                    <div className="font-mono text-emerald text-xl">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-warm-gray mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* About Section */}
            <div className="p-8">
              <div className="text-sm font-bold uppercase tracking-widest text-emerald mb-3">About</div>
              <p className="text-warm-gray">{studio.about || "No description added yet."}</p>
            </div>

            {/* Contact Section */}
            {studio.email && (
              <div className="p-8 border-t border-border">
                <div className="text-sm font-bold uppercase tracking-widest text-emerald mb-3">Contact</div>
                <div className="space-y-2 text-sm">
                  {studio.email && (
                    <p>
                      <span className="font-semibold">Email:</span> {studio.email}
                    </p>
                  )}
                  {studio.phone && (
                    <p>
                      <span className="font-semibold">Phone:</span> {studio.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
    

// import { createFileRoute } from "@tanstack/react-router";
// import { AppShell } from "@/components/app/AppShell";
// import { STUDIO, PHOTOS } from "@/lib/mock/data";

// export const Route = createFileRoute("/dashboard/portfolio")({
//   head: () => ({ meta: [{ title: "Studio Portfolio — DearMemory" }] }),
//   component: Portfolio,
// });

// const SECTIONS = ["Hero banner", "About", "Our story", "Meet the team", "Portfolio showcase", "Featured events", "Packages", "Reviews", "Awards", "Contact"];

// function Portfolio() {
//   return (
//     <AppShell
//       title="Studio Portfolio"
//       subtitle="goldenhour.dearmemory.com"
//       action={
//         <div className="flex gap-2">
//           <a href={`/studio/${STUDIO.slug}`} className="bg-white ring-1 ring-border px-4 py-2 rounded-full text-sm font-semibold">View public</a>
//           <button className="bg-emerald text-white px-5 py-2 rounded-full text-sm font-semibold">Save changes</button>
//         </div>
//       }
//     >
//       <div className="grid grid-cols-12 gap-6">
//         <aside className="col-span-12 lg:col-span-3 bg-white rounded-[1.5rem] ring-1 ring-border p-5 h-fit">
//           <div className="font-bold text-sm mb-3">Sections</div>
//           <div className="space-y-1 text-sm">
//             {SECTIONS.map((s, i) => (
//               <div key={s} className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer ${i === 0 ? "bg-emerald-light text-emerald-deep font-semibold" : "hover:bg-cream"}`}>
//                 <span className="text-warm-gray text-xs">⋮⋮</span>
//                 {s}
//               </div>
//             ))}
//           </div>
//           <button className="mt-4 w-full text-sm font-semibold py-2 rounded-xl border border-dashed border-warm-gray/30 text-warm-gray hover:bg-cream">+ Add section</button>
//         </aside>

//         <div className="col-span-12 lg:col-span-9 bg-cream rounded-[1.5rem] p-6">
//           <div className="bg-white rounded-[1.5rem] overflow-hidden shadow ring-1 ring-border">
//             <div className="relative aspect-[16/8]">
//               <img src={PHOTOS.weddingHero} className="w-full h-full object-cover" alt="" />
//               <div className="absolute inset-0 bg-foreground/30" />
//               <div className="absolute inset-0 flex items-end p-8 text-white">
//                 <div>
//                   <h2 className="text-3xl font-bold">{STUDIO.name}</h2>
//                   <p className="font-serif italic text-lg opacity-90">{STUDIO.tagline}</p>
//                 </div>
//               </div>
//             </div>
//             <div className="p-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-center border-b border-border">
//               {STUDIO.stats.map((s) => (
//                 <div key={s.label}>
//                   <div className="font-mono text-emerald text-xl">{s.value}</div>
//                   <div className="text-[10px] uppercase tracking-widest text-warm-gray mt-1">{s.label}</div>
//                 </div>
//               ))}
//             </div>
//             <div className="p-8">
//               <div className="text-sm font-bold uppercase tracking-widest text-emerald mb-3">About</div>
//               <p className="text-warm-gray">{STUDIO.about}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </AppShell>
//   );
// }
