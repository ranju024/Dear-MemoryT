import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { studioAPI, getMediaUrl } from "@/lib/api/client";

export const Route = createFileRoute("/dashboard/portfolio")({
  head: () => ({
    meta: [{ title: "Studio Portfolio — DearMemory" }],
  }),
  component: Portfolio,
});

type Section = {
  id?: number;
  section_type: string;
  title: string;
  content: Record<string, any>;
  position: number;
  visible: boolean;
};

const DEFAULT_SECTIONS = [
  ["hero", "Hero banner"],
  ["about", "About"],
  ["story", "Our story"],
  ["team", "Meet the team"],
  ["showcase", "Portfolio showcase"],
  ["featured_events", "Featured events"],
  ["packages", "Packages"],
  ["reviews", "Reviews"],
  ["awards", "Awards"],
  ["contact", "Contact"],
];

function Portfolio() {
  const [studio, setStudio] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    try {
      setLoading(true);
      setError(null);

      const [studioData, portfolioData] = await Promise.all([
        studioAPI.getMe(),
        fetchPortfolio(),
      ]);

      setStudio(studioData);
      setSections(portfolioData.sections || []);
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
  }

  async function fetchPortfolio() {
    const token = localStorage.getItem("token");

    const apiUrl = (
      import.meta.env.VITE_API_URL ||
      "http://localhost:8000/api"
    ).replace(/\/$/, "");

    const response = await fetch(`${apiUrl}/portfolio/me`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || "Failed to load portfolio");
    }

    return response.json();
  }

  async function savePortfolio() {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem("token");

      const apiUrl = (
        import.meta.env.VITE_API_URL ||
        "http://localhost:8000/api"
      ).replace(/\/$/, "");

      const payload = {
        sections: sections.map((section, index) => ({
          section_type: section.section_type,
          title: section.title,
          content: section.content,
          position: index,
          visible: section.visible,
        })),
      };

      const response = await fetch(`${apiUrl}/portfolio/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to save portfolio");
      }

      const data = await response.json();

      setSections(data.sections || []);
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
  }

  function updateSection(updates: Partial<Section>) {
    setSections((current) =>
      current.map((section, index) =>
        index === selected
          ? { ...section, ...updates }
          : section
      )
    );
  }

  function updateContent(key: string, value: any) {
    setSections((current) =>
      current.map((section, index) =>
        index === selected
          ? {
              ...section,
              content: {
                ...section.content,
                [key]: value,
              },
            }
          : section
      )
    );
  }

  function addSection() {
    const name = prompt("Enter section name:");

    if (!name?.trim()) return;

    const section: Section = {
      section_type: "custom",
      title: name.trim(),
      content: {
        heading: name.trim(),
        text: "",
      },
      position: sections.length,
      visible: true,
    };

    setSections((current) => [...current, section]);
    setSelected(sections.length);
  }

  function removeSection(index: number) {
    if (sections.length <= 1) {
      alert("You need at least one section.");
      return;
    }

    if (!confirm("Remove this section?")) return;

    setSections((current) =>
      current.filter((_, i) => i !== index)
    );

    setSelected((current) =>
      Math.min(current, sections.length - 2)
    );
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= sections.length) return;

    const copy = [...sections];

    [copy[index], copy[target]] = [
      copy[target],
      copy[index],
    ];

    setSections(copy);
    setSelected(target);
  }

  function toggleVisibility(index: number) {
    setSections((current) =>
      current.map((section, i) =>
        i === index
          ? { ...section, visible: !section.visible }
          : section
      )
    );
  }

  if (loading) {
    return (
      <AppShell
        title="Studio Portfolio"
        subtitle="Loading..."
      >
        <div className="text-center py-16">
          Loading portfolio...
        </div>
      </AppShell>
    );
  }

  if (error && !studio) {
    return (
      <AppShell
        title="Studio Portfolio"
        subtitle="Error"
      >
        <div className="text-center py-16">
          <p className="text-red-600 mb-4">{error}</p>

          <button
            onClick={loadPortfolio}
            className="bg-emerald text-white px-5 py-2 rounded-full font-semibold"
          >
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  const current = sections[selected];

  return (
    <AppShell
      title="Studio Portfolio"
      subtitle={
        studio?.domain ||
        `${studio?.slug || "your-studio"}.dearmemory.com`
      }
      action={
        <div className="flex gap-2">
          {studio?.slug && (
            <a
              href={`/studio/${studio.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white ring-1 ring-border px-4 py-2 rounded-full text-sm font-semibold hover:bg-cream"
            >
              View public
            </a>
          )}

          <button
            onClick={savePortfolio}
            disabled={saving}
            className="bg-emerald text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-emerald-deep disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-5 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* SECTION LIST */}
        <aside className="col-span-12 lg:col-span-3 bg-white rounded-[1.5rem] ring-1 ring-border p-5 h-fit">
          <div className="font-bold text-sm mb-3">
            Portfolio sections
          </div>

          <div className="space-y-1">
            {sections.map((section, index) => (
              <div
                key={`${section.section_type}-${index}`}
                className={`rounded-xl ${
                  selected === index
                    ? "bg-emerald-light"
                    : "hover:bg-cream"
                }`}
              >
                <button
                  onClick={() => setSelected(index)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm"
                >
                  <span className="text-warm-gray text-xs">
                    ⋮⋮
                  </span>

                  <span
                    className={`flex-1 ${
                      selected === index
                        ? "text-emerald-deep font-semibold"
                        : ""
                    }`}
                  >
                    {section.title}
                  </span>

                  {!section.visible && (
                    <span className="text-xs text-warm-gray">
                      Hidden
                    </span>
                  )}
                </button>

                {selected === index && (
                  <div className="flex gap-1 px-3 pb-2">
                    <button
                      onClick={() =>
                        moveSection(index, -1)
                      }
                      className="text-xs px-2 py-1 rounded bg-white ring-1 ring-border"
                      title="Move up"
                    >
                      ↑
                    </button>

                    <button
                      onClick={() =>
                        moveSection(index, 1)
                      }
                      className="text-xs px-2 py-1 rounded bg-white ring-1 ring-border"
                      title="Move down"
                    >
                      ↓
                    </button>

                    <button
                      onClick={() =>
                        toggleVisibility(index)
                      }
                      className="text-xs px-2 py-1 rounded bg-white ring-1 ring-border"
                    >
                      {section.visible
                        ? "Hide"
                        : "Show"}
                    </button>

                    <button
                      onClick={() =>
                        removeSection(index)
                      }
                      className="text-xs px-2 py-1 rounded bg-white ring-1 ring-border text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addSection}
            className="mt-4 w-full text-sm font-semibold py-2 rounded-xl border border-dashed border-warm-gray/30 text-warm-gray hover:bg-cream"
          >
            + Add section
          </button>
        </aside>

        {/* EDITOR */}
        <div className="col-span-12 lg:col-span-9">
          {current ? (
            <div className="bg-white rounded-[1.5rem] ring-1 ring-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-emerald font-bold">
                      Editing section
                    </div>

                    <h2 className="text-2xl font-bold mt-1">
                      {current.title}
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      toggleVisibility(selected)
                    }
                    className="text-sm px-4 py-2 rounded-full ring-1 ring-border"
                  >
                    {current.visible
                      ? "Visible"
                      : "Hidden"}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <Field
                  label="Section title"
                  value={current.title}
                  onChange={(value) =>
                    updateSection({ title: value })
                  }
                />

                <SectionEditor
                  section={current}
                  updateContent={updateContent}
                  studio={studio}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[1.5rem] p-10 text-center ring-1 ring-border">
              No sections yet.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function SectionEditor({
  section,
  updateContent,
  studio,
}: {
  section: Section;
  updateContent: (key: string, value: any) => void;
  studio: any;
}) {
  const c = section.content || {};

  switch (section.section_type) {
    case "hero":
      return (
        <div className="space-y-5">
          <Field
            label="Heading"
            value={c.heading || studio?.name || ""}
            onChange={(v) => updateContent("heading", v)}
          />

          <Field
            label="Subtitle"
            value={c.subtitle || studio?.tagline || ""}
            onChange={(v) =>
              updateContent("subtitle", v)
            }
          />

          <Field
            label="Button text"
            value={c.button_text || ""}
            onChange={(v) =>
              updateContent("button_text", v)
            }
          />

          <Field
            label="Button link"
            value={c.button_link || ""}
            onChange={(v) =>
              updateContent("button_link", v)
            }
          />

          <Field
            label="Background image URL"
            value={c.image || studio?.logo || ""}
            onChange={(v) => updateContent("image", v)}
          />

          {c.image && (
            <img
              src={getMediaUrl(c.image)}
              alt=""
              className="w-full h-48 object-cover rounded-xl"
            />
          )}
        </div>
      );

    case "about":
    case "story":
      return (
        <div className="space-y-5">
          <Field
            label="Heading"
            value={c.heading || ""}
            onChange={(v) => updateContent("heading", v)}
          />

          <TextArea
            label="Description"
            value={c.text || ""}
            onChange={(v) => updateContent("text", v)}
          />

          <Field
            label="Image URL"
            value={c.image || ""}
            onChange={(v) => updateContent("image", v)}
          />

          {c.image && (
            <img
              src={getMediaUrl(c.image)}
              alt=""
              className="w-full max-h-64 object-cover rounded-xl"
            />
          )}
        </div>
      );

    case "team":
      return (
        <TeamEditor
          members={c.members || []}
          updateContent={updateContent}
        />
      );

    case "packages":
      return (
        <PackagesEditor
          packages={c.packages || []}
          updateContent={updateContent}
        />
      );

    case "reviews":
      return (
        <ReviewsEditor
          reviews={c.reviews || []}
          updateContent={updateContent}
        />
      );

    case "awards":
      return (
        <AwardsEditor
          awards={c.awards || []}
          updateContent={updateContent}
        />
      );

    case "showcase":
    case "featured_events":
      return (
        <div className="space-y-5">
          <Field
            label="Heading"
            value={c.heading || ""}
            onChange={(v) => updateContent("heading", v)}
          />

          <TextArea
            label="Description"
            value={c.text || ""}
            onChange={(v) => updateContent("text", v)}
          />

          <TextArea
            label="Items / IDs"
            value={(c.items || []).join("\n")}
            onChange={(v) =>
              updateContent(
                "items",
                v
                  .split("\n")
                  .map((x) => x.trim())
                  .filter(Boolean)
              )
            }
          />

          <p className="text-xs text-warm-gray">
            Add one event/photo identifier per line.
          </p>
        </div>
      );

    case "contact":
      return (
        <div className="space-y-5">
          <Field
            label="Heading"
            value={c.heading || "Contact"}
            onChange={(v) => updateContent("heading", v)}
          />

          <TextArea
            label="Message"
            value={c.text || ""}
            onChange={(v) => updateContent("text", v)}
          />

          <Field
            label="Email"
            value={c.email || studio?.email || ""}
            onChange={(v) => updateContent("email", v)}
          />

          <Field
            label="Phone"
            value={c.phone || studio?.phone || ""}
            onChange={(v) => updateContent("phone", v)}
          />

          <Field
            label="Website"
            value={c.website || studio?.website || ""}
            onChange={(v) =>
              updateContent("website", v)
            }
          />

          <Field
            label="Instagram"
            value={c.instagram || studio?.instagram || ""}
            onChange={(v) =>
              updateContent("instagram", v)
            }
          />
        </div>
      );

    case "custom":
    default:
      return (
        <div className="space-y-5">
          <Field
            label="Heading"
            value={c.heading || ""}
            onChange={(v) => updateContent("heading", v)}
          />

          <TextArea
            label="Content"
            value={c.text || ""}
            onChange={(v) => updateContent("text", v)}
          />

          <Field
            label="Image URL"
            value={c.image || ""}
            onChange={(v) => updateContent("image", v)}
          />
        </div>
      );
  }
}

function TeamEditor({
  members,
  updateContent,
}: {
  members: any[];
  updateContent: (key: string, value: any) => void;
}) {
  function update(index: number, key: string, value: any) {
    const copy = [...members];
    copy[index] = { ...copy[index], [key]: value };
    updateContent("members", copy);
  }

  function add() {
    updateContent("members", [
      ...members,
      {
        name: "",
        role: "",
        bio: "",
        image: "",
      },
    ]);
  }

  function remove(index: number) {
    updateContent(
      "members",
      members.filter((_, i) => i !== index)
    );
  }

  return (
    <div className="space-y-5">
      {members.map((member, index) => (
        <div
          key={index}
          className="p-5 rounded-xl bg-cream space-y-4"
        >
          <div className="flex justify-between">
            <strong>Team member {index + 1}</strong>

            <button
              onClick={() => remove(index)}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </div>

          <Field
            label="Name"
            value={member.name || ""}
            onChange={(v) =>
              update(index, "name", v)
            }
          />

          <Field
            label="Role"
            value={member.role || ""}
            onChange={(v) =>
              update(index, "role", v)
            }
          />

          <TextArea
            label="Bio"
            value={member.bio || ""}
            onChange={(v) =>
              update(index, "bio", v)
            }
          />

          <Field
            label="Photo URL"
            value={member.image || ""}
            onChange={(v) =>
              update(index, "image", v)
            }
          />
        </div>
      ))}

      <button
        onClick={add}
        className="px-4 py-2 rounded-xl border border-dashed border-warm-gray/40 text-sm font-semibold"
      >
        + Add team member
      </button>
    </div>
  );
}

function PackagesEditor({
  packages,
  updateContent,
}: {
  packages: any[];
  updateContent: (key: string, value: any) => void;
}) {
  function update(index: number, key: string, value: any) {
    const copy = [...packages];
    copy[index] = { ...copy[index], [key]: value };
    updateContent("packages", copy);
  }

  function add() {
    updateContent("packages", [
      ...packages,
      {
        name: "",
        price: "",
        description: "",
        features: [],
      },
    ]);
  }

  function remove(index: number) {
    updateContent(
      "packages",
      packages.filter((_, i) => i !== index)
    );
  }

  return (
    <div className="space-y-5">
      {packages.map((item, index) => (
        <div
          key={index}
          className="p-5 rounded-xl bg-cream space-y-4"
        >
          <div className="flex justify-between">
            <strong>Package {index + 1}</strong>

            <button
              onClick={() => remove(index)}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </div>

          <Field
            label="Package name"
            value={item.name || ""}
            onChange={(v) =>
              update(index, "name", v)
            }
          />

          <Field
            label="Price"
            value={item.price || ""}
            onChange={(v) =>
              update(index, "price", v)
            }
          />

          <TextArea
            label="Description"
            value={item.description || ""}
            onChange={(v) =>
              update(index, "description", v)
            }
          />

          <TextArea
            label="Features (one per line)"
            value={(item.features || []).join("\n")}
            onChange={(v) =>
              update(
                index,
                "features",
                v
                  .split("\n")
                  .map((x) => x.trim())
                  .filter(Boolean)
              )
            }
          />
        </div>
      ))}

      <button
        onClick={add}
        className="px-4 py-2 rounded-xl border border-dashed border-warm-gray/40 text-sm font-semibold"
      >
        + Add package
      </button>
    </div>
  );
}

function ReviewsEditor({
  reviews,
  updateContent,
}: {
  reviews: any[];
  updateContent: (key: string, value: any) => void;
}) {
  function update(index: number, key: string, value: any) {
    const copy = [...reviews];
    copy[index] = { ...copy[index], [key]: value };
    updateContent("reviews", copy);
  }

  function add() {
    updateContent("reviews", [
      ...reviews,
      {
        name: "",
        text: "",
        rating: 5,
      },
    ]);
  }

  function remove(index: number) {
    updateContent(
      "reviews",
      reviews.filter((_, i) => i !== index)
    );
  }

  return (
    <div className="space-y-5">
      {reviews.map((review, index) => (
        <div
          key={index}
          className="p-5 rounded-xl bg-cream space-y-4"
        >
          <div className="flex justify-between">
            <strong>Review {index + 1}</strong>

            <button
              onClick={() => remove(index)}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </div>

          <Field
            label="Client name"
            value={review.name || ""}
            onChange={(v) =>
              update(index, "name", v)
            }
          />

          <TextArea
            label="Review"
            value={review.text || ""}
            onChange={(v) =>
              update(index, "text", v)
            }
          />

          <Field
            label="Rating"
            type="number"
            value={review.rating ?? 5}
            onChange={(v) =>
              update(index, "rating", Number(v))
            }
          />
        </div>
      ))}

      <button
        onClick={add}
        className="px-4 py-2 rounded-xl border border-dashed border-warm-gray/40 text-sm font-semibold"
      >
        + Add review
      </button>
    </div>
  );
}

function AwardsEditor({
  awards,
  updateContent,
}: {
  awards: any[];
  updateContent: (key: string, value: any) => void;
}) {
  function update(index: number, key: string, value: any) {
    const copy = [...awards];
    copy[index] = { ...copy[index], [key]: value };
    updateContent("awards", copy);
  }

  function add() {
    updateContent("awards", [
      ...awards,
      {
        name: "",
        year: "",
        description: "",
      },
    ]);
  }

  function remove(index: number) {
    updateContent(
      "awards",
      awards.filter((_, i) => i !== index)
    );
  }

  return (
    <div className="space-y-5">
      {awards.map((award, index) => (
        <div
          key={index}
          className="p-5 rounded-xl bg-cream space-y-4"
        >
          <div className="flex justify-between">
            <strong>Award {index + 1}</strong>

            <button
              onClick={() => remove(index)}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </div>

          <Field
            label="Award name"
            value={award.name || ""}
            onChange={(v) =>
              update(index, "name", v)
            }
          />

          <Field
            label="Year"
            value={award.year || ""}
            onChange={(v) =>
              update(index, "year", v)
            }
          />

          <TextArea
            label="Description"
            value={award.description || ""}
            onChange={(v) =>
              update(index, "description", v)
            }
          />
        </div>
      ))}

      <button
        onClick={add}
        className="px-4 py-2 rounded-xl border border-dashed border-warm-gray/40 text-sm font-semibold"
      >
        + Add award
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: any;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-2">
        {label}
      </span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald/30"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-2">
        {label}
      </span>

      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none resize-y focus:ring-2 focus:ring-emerald/30"
      />
    </label>
  );
}