import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { TEMPLATES } from "@/lib/mock/data";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — DearMemory" },
      { name: "description", content: "Browse beautifully designed event website templates — weddings, graduations, concerts, and more." },
      { property: "og:title", content: "DearMemory Templates" },
      { property: "og:description", content: "Beautifully designed event website templates for every kind of memory." },
    ],
  }),
  component: Templates,
});

const CATEGORIES = ["All", "Weddings", "Graduations", "Concerts", "Corporate", "Birthdays", "Sports"];

function Templates() {
  return (
    <div className="bg-background">
      <SiteNav />
      <header className="container mx-auto px-6 pt-20 pb-12 text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-emerald mb-3">Template Library</div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 max-w-3xl mx-auto">Templates that feel like the moment itself</h1>
        <p className="text-warm-gray max-w-xl mx-auto">Pick a starting point, then make it yours. Every template is fully customizable.</p>
        <div className="flex flex-wrap justify-center gap-2 mt-10">
          {CATEGORIES.map((c, i) => (
            <button
              key={c}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                i === 0 ? "bg-emerald text-white" : "bg-white ring-1 ring-border text-warm-gray hover:bg-cream"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <section className="container mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((t) => (
            <Link to="/event/$slug" params={{ slug: "the-laurent-wedding" }} key={t.id} className="group">
              <div className="bg-white rounded-[2rem] overflow-hidden ring-1 ring-border hover:-translate-y-1 transition-all hover:shadow-xl">
                <div className={`relative aspect-[4/5] ${t.accent}`}>
                  <img src={t.cover} alt={t.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-warm-gray font-bold mb-1">{t.category}</div>
                    <div className="font-bold text-lg">{t.name}</div>
                    <p className="text-sm text-warm-gray mt-1">{t.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
