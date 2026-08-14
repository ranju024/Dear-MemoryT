import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import {
  studioAPI,
  portfolioAPI,
  getMediaUrl,
  type PortfolioSection,
} from "@/lib/api/client";

export const Route = createFileRoute("/dashboard/portfolio")({
  head: () => ({
    meta: [{ title: "Studio Portfolio — DearMemory" }],
  }),
  component: Portfolio,
});

const DEFAULT_SECTION_TYPES = [
  { type: "hero", title: "Hero banner" },
  { type: "about", title: "About" },
  { type: "story", title: "Our story" },
  { type: "team", title: "Meet the team" },
  { type: "showcase", title: "Portfolio showcase" },
  { type: "featured_events", title: "Featured events" },
  { type: "packages", title: "Packages" },
  { type: "reviews", title: "Reviews" },
  { type: "awards", title: "Awards" },
  { type: "contact", title: "Contact" },
];

function Portfolio() {
  const [studio, setStudio] = useState<any>(null);
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);

      const studioData = await studioAPI.getMe();
      setStudio(studioData);

      const portfolioData = await portfolioAPI.get();

      setSections(
        [...(portfolioData.sections || [])].sort(
          (a, b) => a.position - b.position
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load portfolio"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!studio) return;

    try {
      setSaving(true);
      setError(null);

      const updatedSections = sections.map((section, index) => ({
        ...section,
        position: index,
      }));

      // Save studio information too.
      // Portfolio sections are saved separately.
      await portfolioAPI.update(updatedSections);

      setSections(updatedSections);

      alert("Portfolio saved successfully!");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save portfolio"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = () => {
    const available = DEFAULT_SECTION_TYPES.filter(
      (defaultSection) =>
        !sections.some(
          (section) =>
            section.section_type === defaultSection.type
        )
    );

    if (available.length === 0) {
      alert("All portfolio sections have already been added.");
      return;
    }

    const options = available
      .map(
        (section, index) =>
          `${index + 1}. ${section.title}`
      )
      .join("\n");

    const choice = prompt(
      `Choose a section to add:\n\n${options}\n\nEnter the number:`
    );

    if (!choice) return;

    const index = Number(choice) - 1;

    if (
      Number.isNaN(index) ||
      index < 0 ||
      index >= available.length
    ) {
      alert("Invalid section.");
      return;
    }

    const selected = available[index];

    const newSection: PortfolioSection = {
      id: -Date.now(),
      section_type: selected.type,
      title: selected.title,
      content: {},
      position: sections.length,
      visible: true,
    };

    setSections((current) => [
      ...current,
      newSection,
    ]);

    setActiveSection(selected.type);
  };

  const handleDeleteSection = (id: number) => {
    const section = sections.find(
      (item) => item.id === id
    );

    if (!section) return;

    const confirmed = window.confirm(
      `Remove "${section.title}" from your portfolio?`
    );

    if (!confirmed) return;

    const updated = sections
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        position: index,
      }));

    setSections(updated);

    if (activeSection === section.section_type) {
      setActiveSection(
        updated[0]?.section_type || "hero"
      );
    }
  };

  const toggleSectionVisibility = (id: number) => {
    setSections((current) =>
      current.map((section) =>
        section.id === id
          ? {
              ...section,
              visible: !section.visible,
            }
          : section
      )
    );
  };

  const moveSection = (
    index: number,
    direction: "up" | "down"
  ) => {
    const newIndex =
      direction === "up" ? index - 1 : index + 1;

    if (
      newIndex < 0 ||
      newIndex >= sections.length
    ) {
      return;
    }

    const updated = [...sections];

    [updated[index], updated[newIndex]] = [
      updated[newIndex],
      updated[index],
    ];

    setSections(
      updated.map((section, position) => ({
        ...section,
        position,
      }))
    );
  };

  if (loading) {
    return (
      <AppShell
        title="Studio Portfolio"
        subtitle="Loading..."
      >
        <div className="text-center py-12">
          Loading portfolio...
        </div>
      </AppShell>
    );
  }

  if (error || !studio) {
    return (
      <AppShell
        title="Studio Portfolio"
        subtitle="Error"
      >
        <div className="text-center py-12">
          <p className="text-red-600 mb-6">
            {error || "Studio profile not found"}
          </p>

          <button
            onClick={async () => {
              try {
                const newStudio =
                  await studioAPI.create({
                    name: "My Studio",
                    tagline:
                      "Professional photography",
                  });

                setStudio(newStudio);

                await loadPortfolio();
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Failed to create studio profile"
                );
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
  const studioDomain =
    studio.domain ||
    "goldenhour.dearmemory.com";

  const active =
    sections.find(
      (section) =>
        section.section_type === activeSection
    ) || sections[0];

  return (
    <AppShell
      title="Studio Portfolio"
      subtitle={studioDomain}
      action={
        <div className="flex gap-2">
          <a
            href={`/studio/${studioSlug}`}
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
            {saving
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-12 gap-6">

        {/* LEFT: SECTION MANAGER */}
        <aside className="col-span-12 lg:col-span-3 bg-white rounded-[1.5rem] ring-1 ring-border p-5 h-fit">
          <div className="font-bold text-sm mb-3">
            Sections
          </div>

          <div className="space-y-1 text-sm">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl ${
                  activeSection ===
                  section.section_type
                    ? "bg-emerald-light text-emerald-deep font-semibold"
                    : "hover:bg-cream"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      section.section_type
                    )
                  }
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  <span className="text-warm-gray text-xs">
                    ⋮⋮
                  </span>

                  <span className="truncate">
                    {section.title}
                  </span>
                </button>

                {/* Visibility */}
                <button
                  type="button"
                  title={
                    section.visible
                      ? "Hide section"
                      : "Show section"
                  }
                  onClick={() =>
                    toggleSectionVisibility(
                      section.id
                    )
                  }
                  className="text-xs opacity-60 hover:opacity-100"
                >
                  {section.visible
                    ? "◉"
                    : "○"}
                </button>

                {/* Move */}
                <div className="hidden group-hover:flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() =>
                      moveSection(index, "up")
                    }
                    className="text-xs disabled:opacity-20"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    disabled={
                      index === sections.length - 1
                    }
                    onClick={() =>
                      moveSection(index, "down")
                    }
                    className="text-xs disabled:opacity-20"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddSection}
            className="mt-4 w-full text-sm font-semibold py-2 rounded-xl border border-dashed border-warm-gray/30 text-warm-gray hover:bg-cream transition-colors"
          >
            + Add section
          </button>

          {active && (
            <button
              onClick={() =>
                handleDeleteSection(active.id)
              }
              className="mt-2 w-full text-sm font-semibold py-2 rounded-xl text-red-500 hover:bg-red-50"
            >
              Remove selected section
            </button>
          )}
        </aside>

        {/* RIGHT: PORTFOLIO PREVIEW */}
        <div className="col-span-12 lg:col-span-9 bg-cream rounded-[1.5rem] p-6">

          {active && (
            <div className="mb-4 bg-white rounded-xl px-4 py-3 ring-1 ring-border flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-warm-gray">
                  Editing section
                </div>

                <div className="font-bold">
                  {active.title}
                </div>
              </div>

              <div
                className={`text-xs font-semibold ${
                  active.visible
                    ? "text-emerald-deep"
                    : "text-warm-gray"
                }`}
              >
                {active.visible
                  ? "Visible"
                  : "Hidden"}
              </div>
            </div>
          )}

          <div className="bg-white rounded-[1.5rem] overflow-hidden shadow ring-1 ring-border">

            {/* HERO */}
            <div
              className={`relative aspect-[16/8] ${
                !isVisible(
                  sections,
                  "hero"
                )
                  ? "opacity-40"
                  : ""
              }`}
            >
              {studio.cover_image ? (
                <img
                  src={getMediaUrl(
                    studio.cover_image
                  )}
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
                  <h2 className="text-3xl font-bold">
                    {studio.name}
                  </h2>

                  <p className="font-serif italic text-lg opacity-90">
                    {studio.tagline}
                  </p>
                </div>
              </div>
            </div>

            {/* STATS */}
            {studio.stats &&
              studio.stats.length > 0 && (
                <div className="p-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-center border-b border-border">
                  {studio.stats.map(
                    (s: any) => (
                      <div key={s.label}>
                        <div className="font-mono text-emerald text-xl">
                          {s.value}
                        </div>

                        <div className="text-[10px] uppercase tracking-widest text-warm-gray mt-1">
                          {s.label}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

            {/* ABOUT */}
            {isVisible(
              sections,
              "about"
            ) && (
              <div className="p-8">
                <div className="text-sm font-bold uppercase tracking-widest text-emerald mb-3">
                  About
                </div>

                <p className="text-warm-gray">
                  {studio.about ||
                    "No description added yet."}
                </p>
              </div>
            )}

            {/* OTHER SECTIONS PLACEHOLDERS */}
            {sections
              .filter(
                (section) =>
                  ![
                    "hero",
                    "about",
                  ].includes(
                    section.section_type
                  )
              )
              .map((section) => (
                <div
                  key={section.id}
                  className={`p-8 border-t border-border ${
                    !section.visible
                      ? "opacity-40"
                      : ""
                  }`}
                >
                  <div className="text-sm font-bold uppercase tracking-widest text-emerald mb-3">
                    {section.title}
                  </div>

                  <p className="text-warm-gray">
                    This section is ready to be configured.
                  </p>
                </div>
              ))}

            {/* CONTACT */}
            {isVisible(
              sections,
              "contact"
            ) &&
              (studio.email ||
                studio.phone) && (
                <div className="p-8 border-t border-border">
                  <div className="text-sm font-bold uppercase tracking-widest text-emerald mb-3">
                    Contact
                  </div>

                  <div className="space-y-2 text-sm">
                    {studio.email && (
                      <p>
                        <span className="font-semibold">
                          Email:
                        </span>{" "}
                        {studio.email}
                      </p>
                    )}

                    {studio.phone && (
                      <p>
                        <span className="font-semibold">
                          Phone:
                        </span>{" "}
                        {studio.phone}
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

function isVisible(
  sections: PortfolioSection[],
  type: string
) {
  const section = sections.find(
    (item) => item.section_type === type
  );

  return section
    ? section.visible
    : true;
}