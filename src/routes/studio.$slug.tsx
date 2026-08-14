import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  studioAPI,
  photosAPI,
  portfolioAPI,
  getMediaUrl,
} from "@/lib/api/client";

export const Route = createFileRoute("/studio/$slug")({
  head: () => ({ meta: [{ title: "Studio — DearMemory" }] }),
  component: Studio,
});

function getContentValue(
  content: Record<string, any>,
  keys: string[],
  fallback = "",
) {
  for (const key of keys) {
    const value = content?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
}

function RenderContent({
  content,
  primary,
}: {
  content: Record<string, any>;
  primary: string;
}) {
  if (!content || typeof content !== "object") {
    return null;
  }

  const entries = Object.entries(content);

  if (!entries.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          key === "image" ||
          key === "image_url" ||
          key === "cover_image"
        ) {
          return null;
        }

        const label = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: primary }}
              >
                {label}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {value.map((item, index) => {
                  if (typeof item === "string") {
                    return (
                      <div
                        key={index}
                        className="bg-white rounded-3xl p-5 ring-1 ring-border"
                      >
                        {item}
                      </div>
                    );
                  }

                  if (typeof item === "object" && item !== null) {
                    const image =
                      item.image ||
                      item.image_url ||
                      item.cover_image ||
                      item.url;

                    return (
                      <div
                        key={index}
                        className="bg-white rounded-3xl overflow-hidden ring-1 ring-border"
                      >
                        {image && (
                          <img
                            src={getMediaUrl(image)}
                            alt=""
                            className="w-full aspect-[4/3] object-cover"
                          />
                        )}

                        <div className="p-5">
                          {Object.entries(item).map(
                            ([itemKey, itemValue]) => {
                              if (
                                itemKey === "image" ||
                                itemKey === "image_url" ||
                                itemKey === "cover_image" ||
                                itemKey === "url" ||
                                itemValue === null ||
                                itemValue === undefined ||
                                itemValue === ""
                              ) {
                                return null;
                              }

                              return (
                                <div key={itemKey} className="mb-2">
                                  <div className="text-xs uppercase tracking-widest opacity-50">
                                    {itemKey.replace(/_/g, " ")}
                                  </div>
                                  <div className="mt-1">
                                    {String(itemValue)}
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          );
        }

        if (typeof value === "object") {
          return (
            <div
              key={key}
              className="bg-white rounded-3xl p-6 ring-1 ring-border"
            >
              <div
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: primary }}
              >
                {label}
              </div>

              <RenderContent content={value} primary={primary} />
            </div>
          );
        }

        return (
          <div key={key}>
            <div className="text-xs uppercase tracking-widest opacity-50">
              {label}
            </div>
            <p className="mt-1 leading-relaxed">{String(value)}</p>
          </div>
        );
      })}
    </div>
  );
}

function Studio() {
  const { slug } = Route.useParams();

  const [studio, setStudio] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [portfolioPhotos, setPortfolioPhotos] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [sent, setSent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const [studioData, eventData, portfolioData] =
          await Promise.all([
            studioAPI.getBySlug(slug),
            studioAPI.getPublicEvents(slug),
            portfolioAPI.getPublicBySlug(slug),
          ]);

        setStudio(studioData);
        setEvents(eventData || []);
        setPortfolio(portfolioData?.sections || []);

        const photoGroups = await Promise.all(
          (eventData || [])
            .slice(0, 8)
            .map((event: any) =>
              photosAPI.list(event.id).catch(() => []),
            ),
        );

        setPortfolioPhotos(
          photoGroups.flat().slice(0, 24),
        );
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Studio not found",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!events[0]) {
      setSent(true);
      return;
    }

    try {
      const { leadsAPI } =
        await import("@/lib/api/client");

      await leadsAPI.createPublic(events[0].slug, {
        name: contact.name,
        email: contact.email || undefined,
        phone: contact.phone || undefined,
        notes: contact.message || undefined,
        source: "Public studio page",
      });

      setSent(true);

      setContact({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Couldn't send your inquiry",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading studio…
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || "Studio not found"}
      </div>
    );
  }

  const primary =
    studio.primary_color || "#4a7c6a";

  const background =
    studio.background_color || "#ffffff";

  const visibleSections = portfolio
    .filter((section) => section.visible)
    .sort(
      (a, b) =>
        (a.position ?? 0) - (b.position ?? 0),
    );

  /*
   * If the portfolio has not been configured yet,
   * keep the existing public page behavior.
   */
  const hasPortfolio =
    visibleSections.length > 0;

  const renderSection = (section: any) => {
    const content =
      section.content || {};

    const type = section.section_type;

    const image =
      getContentValue(
        content,
        ["image", "image_url", "cover_image"],
        "",
      );

    const description =
      getContentValue(
        content,
        ["description", "text", "body", "content"],
        "",
      );

    const heading =
      getContentValue(
        content,
        ["heading", "headline", "title"],
        section.title,
      );

    /*
     * HERO
     */
    if (type === "hero") {
      const heroImage =
        image || studio.cover_image;

      return (
        <header
          key={section.id}
          className="relative pt-16"
        >
          <div
            className="max-w-7xl mx-auto px-6 py-20 md:py-28"
            style={
              heroImage
                ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,.3), rgba(0,0,0,.3)), url("${getMediaUrl(heroImage)}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: primary }}
            >
              {getContentValue(
                content,
                ["eyebrow", "label"],
                "Photography Studio",
              )}
            </p>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              {getContentValue(
                content,
                ["heading", "headline", "title"],
                studio.name,
              )}
            </h1>

            <p className="font-serif italic text-xl md:text-2xl mt-4 opacity-75">
              {getContentValue(
                content,
                ["tagline", "subtitle"],
                studio.tagline,
              )}
            </p>

            {description && (
              <p className="max-w-2xl mt-6 opacity-70 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </header>
      );
    }

    /*
     * ABOUT
     */
    if (type === "about") {
      return (
        <section
          key={section.id}
          className="max-w-5xl mx-auto px-6 py-20"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: primary }}
          >
            About
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-2">
            {heading}
          </h2>

          <div className="mt-8 text-lg leading-relaxed opacity-75">
            {description || studio.about || (
              <RenderContent
                content={content}
                primary={primary}
              />
            )}
          </div>
        </section>
      );
    }

    /*
     * STORY / TEAM / PACKAGES / REVIEWS / AWARDS
     */
    if (
      [
        "story",
        "team",
        "packages",
        "reviews",
        "awards",
      ].includes(type)
    ) {
      return (
        <section
          key={section.id}
          className="max-w-7xl mx-auto px-6 py-20"
        >
          <div className="mb-10">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: primary }}
            >
              {section.title}
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mt-2">
              {heading}
            </h2>
          </div>

          {description && (
            <p className="max-w-3xl text-lg leading-relaxed opacity-75 mb-10">
              {description}
            </p>
          )}

          <RenderContent
            content={content}
            primary={primary}
          />
        </section>
      );
    }

    /*
     * PORTFOLIO SHOWCASE
     */
    if (type === "showcase") {
      const showcasePhotos =
        content.photos ||
        content.images ||
        content.items ||
        [];

      return (
        <section
          key={section.id}
          className="max-w-7xl mx-auto px-6 py-20"
        >
          <div className="mb-10">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: primary }}
            >
              Selected work
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mt-2">
              {heading || "Stories we've captured"}
            </h2>
          </div>

          {showcasePhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {showcasePhotos.map(
                (photo: any, index: number) => {
                  const url =
                    typeof photo === "string"
                      ? photo
                      : photo?.url ||
                        photo?.image ||
                        photo?.image_url;

                  if (!url) return null;

                  return (
                    <img
                      key={photo?.id || index}
                      src={getMediaUrl(url)}
                      alt={
                        photo?.title ||
                        photo?.filename ||
                        ""
                      }
                      loading="lazy"
                      className="w-full aspect-square object-cover rounded-2xl hover:scale-[1.02] transition-transform"
                    />
                  );
                },
              )}
            </div>
          ) : portfolioPhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {portfolioPhotos.map(
                (photo: any) => (
                  <img
                    key={photo.id}
                    src={getMediaUrl(photo.url)}
                    alt={
                      photo.title ||
                      photo.filename ||
                      ""
                    }
                    loading="lazy"
                    className="w-full aspect-square object-cover rounded-2xl hover:scale-[1.02] transition-transform"
                  />
                ),
              )}
            </div>
          ) : (
            <RenderContent
              content={content}
              primary={primary}
            />
          )}
        </section>
      );
    }

    /*
     * FEATURED EVENTS
     */
    if (type === "featured_events") {
      return (
        <section
          key={section.id}
          className="max-w-7xl mx-auto px-6 py-20"
        >
          <div className="mb-10">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: primary }}
            >
              Featured galleries
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mt-2">
              {heading || "Recent events"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <a
                key={event.id}
                href={`/event/${event.slug}`}
                className="bg-white rounded-3xl overflow-hidden ring-1 ring-border hover:shadow-lg transition-shadow"
              >
                {event.cover_image ? (
                  <img
                    src={getMediaUrl(event.cover_image)}
                    alt=""
                    className="w-full aspect-[4/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] bg-cream" />
                )}

                <div className="p-5">
                  <p className="text-xs uppercase tracking-widest opacity-60">
                    {event.type}
                  </p>

                  <h3 className="font-bold text-xl mt-1">
                    {event.title}
                  </h3>

                  <p className="text-sm opacity-60 mt-2">
                    {new Date(
                      event.date,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      );
    }

    /*
     * CONTACT
     */
    if (type === "contact") {
      return (
        <section
          key={section.id}
          className="py-20"
          style={{
            backgroundColor: `${primary}12`,
          }}
        >
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-10">
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: primary }}
              >
                Contact
              </p>

              <h2 className="text-4xl font-bold mt-2">
                {heading ||
                  "Let's create something beautiful"}
              </h2>

              {description && (
                <p className="mt-4 opacity-70">
                  {description}
                </p>
              )}
            </div>

            {sent ? (
              <div className="bg-white rounded-3xl p-10 text-center ring-1 ring-border">
                Thanks — your inquiry has been received.
              </div>
            ) : (
              <form
                onSubmit={submitLead}
                className="bg-white rounded-3xl p-8 space-y-4 ring-1 ring-border"
              >
                <input
                  required
                  value={contact.name}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      name: e.target.value,
                    })
                  }
                  className="w-full bg-cream rounded-2xl px-4 py-3 text-sm outline-none"
                  placeholder="Your name"
                />

                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      email: e.target.value,
                    })
                  }
                  className="w-full bg-cream rounded-2xl px-4 py-3 text-sm outline-none"
                  placeholder="Email"
                />

                <input
                  value={contact.phone}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      phone: e.target.value,
                    })
                  }
                  className="w-full bg-cream rounded-2xl px-4 py-3 text-sm outline-none"
                  placeholder="Phone (optional)"
                />

                <textarea
                  rows={5}
                  value={contact.message}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      message: e.target.value,
                    })
                  }
                  className="w-full bg-cream rounded-2xl px-4 py-3 text-sm outline-none"
                  placeholder="Tell us about your event…"
                />

                <button
                  type="submit"
                  className="w-full text-white py-4 rounded-full font-bold"
                  style={{
                    backgroundColor: primary,
                  }}
                >
                  Request quote
                </button>
              </form>
            )}
          </div>
        </section>
      );
    }

    /*
     * CUSTOM / UNKNOWN SECTION
     *
     * This is important: if your dashboard adds a new
     * section type, its saved content will still appear.
     */
    return (
      <section
        key={section.id}
        className="max-w-7xl mx-auto px-6 py-20"
      >
        <div className="mb-10">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: primary }}
          >
            {section.title}
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mt-2">
            {heading}
          </h2>
        </div>

        {description && (
          <p className="max-w-3xl text-lg leading-relaxed opacity-75 mb-10">
            {description}
          </p>
        )}

        <RenderContent
          content={content}
          primary={primary}
        />
      </section>
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: background,
        color: studio.text_color || "#2d2a29",
      }}
    >
      <SiteNav />

      {hasPortfolio ? (
        <>
          {visibleSections.map(renderSection)}
        </>
      ) : (
        <>
          {/* Existing fallback page when no portfolio sections exist */}

          <header className="relative pt-16">
            <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: primary }}
              >
                Photography Studio
              </p>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                {studio.name}
              </h1>

              <p className="font-serif italic text-xl md:text-2xl mt-4 opacity-75">
                {studio.tagline}
              </p>

              {studio.about && (
                <p className="max-w-2xl mt-6 opacity-70 leading-relaxed">
                  {studio.about}
                </p>
              )}
            </div>
          </header>

          <section className="py-12 bg-white/60 border-y border-border">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                [
                  "Events",
                  studio.total_events ?? events.length,
                ],
                [
                  "Photos",
                  studio.total_photos ??
                    portfolioPhotos.length,
                ],
                [
                  "Location",
                  studio.city || "Worldwide",
                ],
                [
                  "Rating",
                  studio.rating || "5.0",
                ],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: primary }}
                  >
                    {value}
                  </div>

                  <div className="text-xs uppercase tracking-widest opacity-60 mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {portfolioPhotos.length > 0 && (
            <section className="max-w-7xl mx-auto px-6 py-20">
              <div className="mb-10">
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: primary }}
                >
                  Selected work
                </p>

                <h2 className="text-4xl md:text-5xl font-bold mt-2">
                  Stories we've captured
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {portfolioPhotos.map((photo: any) => (
                  <img
                    key={photo.id}
                    src={getMediaUrl(photo.url)}
                    alt={
                      photo.title ||
                      photo.filename ||
                      ""
                    }
                    loading="lazy"
                    className="w-full aspect-square object-cover rounded-2xl"
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <SiteFooter />
    </div>
  );
}