import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PHOTOS, TEMPLATES, TESTIMONIALS, EVENT_TYPES } from "@/lib/mock/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DearMemory — Beautiful Event Websites for Photography Studios" },
      { name: "description", content: "Turn galleries into memorable digital experiences. Premium event websites, studio portfolios, and storytelling for photographers." },
      { property: "og:title", content: "DearMemory — Beautiful Event Websites" },
      { property: "og:description", content: "Turn galleries into memorable digital experiences. Premium event websites for photographers." },
      { property: "og:image", content: PHOTOS.weddingHero },
      { name: "twitter:image", content: PHOTOS.weddingHero },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="bg-background font-display text-foreground">
      <SiteNav />

      {/* Hero — layered collage */}
      <header className="relative pt-16 md:pt-24 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border text-xs font-semibold uppercase tracking-widest text-emerald mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
            For modern photography studios
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance mb-6 animate-fade-up max-w-4xl mx-auto leading-[1.05]">
            Create Stunning Event Websites <br className="hidden md:block" />
            That People <span className="text-emerald italic font-serif font-normal">Never Forget</span>
          </h1>
          <p className="max-w-xl mx-auto text-lg text-warm-gray mb-10 animate-fade-up [animation-delay:100ms]">
            Transform your photo galleries into emotional digital experiences. Designed for studios who value the art of the memory.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-up [animation-delay:200ms]">
            <Link
              to="/register"
              className="bg-emerald text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-emerald/15 hover:bg-emerald-deep transition-all hover:-translate-y-0.5"
            >
              Start Creating
            </Link>
            <button className="bg-white border border-border px-8 py-4 rounded-full font-bold hover:bg-cream transition-all">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Layered collage */}
        <div className="mt-16 relative h-[420px] md:h-[600px] animate-fade-up [animation-delay:400ms]">
          <div className="absolute left-[4%] md:left-[10%] top-10 -rotate-[5deg] w-56 md:w-72 shadow-2xl ring-8 ring-white rounded-[2rem] overflow-hidden">
            <img src={PHOTOS.weddingCouple} alt="Wedding archive preview" className="aspect-[4/5] object-cover w-full" loading="eager" />
          </div>
          <div className="absolute right-[4%] md:right-[10%] top-0 rotate-[4deg] w-52 md:w-72 shadow-2xl ring-8 ring-white rounded-[2rem] overflow-hidden hidden sm:block">
            <img src={PHOTOS.graduationGroup} alt="Graduation gallery preview" className="aspect-[4/5] object-cover w-full" />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-16 md:top-20 w-[92%] md:w-[640px] shadow-2xl ring-[10px] md:ring-[12px] ring-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden z-20">
            <BrowserMockup />
          </div>
        </div>
      </header>

      {/* Social proof */}
      <section className="py-12 border-y border-border bg-white/60">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { v: "1,200+", l: "Studios" },
              { v: "45,000", l: "Events published" },
              { v: "12M+", l: "Photos delivered" },
              { v: "2.3M", l: "Memories preserved" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="font-mono text-emerald text-2xl mb-2">{s.v}</div>
                <div className="text-xs uppercase tracking-widest font-bold text-warm-gray">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — bento */}
      <section id="features" className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Everything for the modern studio</h2>
            <p className="text-warm-gray max-w-lg mx-auto">Tools built to honor the craft of photography — not bury it in software.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[240px]">
            {/* AI Search */}
            <div className="md:col-span-2 bg-emerald-light rounded-[2.5rem] p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-emerald mb-3">Intelligent search</div>
                <h3 className="text-2xl font-bold mb-2">Find yourself in seconds</h3>
                <p className="text-sm text-emerald-deep/70 max-w-sm">AI facial recognition and semantic search. Guests stop scrolling — they discover.</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-black/5 flex items-center gap-3 max-w-md">
                <div className="w-8 h-8 rounded-full bg-emerald/20 grid place-items-center text-emerald font-bold text-xs">AI</div>
                <div className="text-sm text-warm-gray">find photos of the bride dancing…</div>
              </div>
            </div>
            {/* QR */}
            <div className="bg-sky rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white rounded-3xl mb-6 shadow-md grid place-items-center ring-1 ring-black/5">
                <QRGlyph />
              </div>
              <h3 className="text-xl font-bold">Instant QR Sharing</h3>
              <p className="text-xs text-warm-gray mt-2">One scan, the gallery opens.</p>
            </div>
            {/* Guestbooks */}
            <div className="bg-lavender rounded-[2.5rem] p-8">
              <h3 className="text-xl font-bold mb-2">Digital Guestbooks</h3>
              <p className="text-sm text-warm-gray">Collect heartfelt messages alongside the photos.</p>
              <div className="mt-6 space-y-2">
                <div className="bg-white/70 p-3 rounded-xl text-[11px] shadow-sm">"Best wedding ever 💚"</div>
                <div className="bg-white/70 p-3 rounded-xl text-[11px] translate-x-4 shadow-sm">"Beautiful photos, thank you!"</div>
                <div className="bg-white/70 p-3 rounded-xl text-[11px] translate-x-2 shadow-sm">"We'll never forget this night."</div>
              </div>
            </div>
            {/* Analytics */}
            <div className="md:col-span-2 bg-cream rounded-[2.5rem] p-8 ring-1 ring-border">
              <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-widest text-warm-gray mb-3">Studio analytics</div>
                  <h3 className="text-2xl font-bold mb-2">See what guests love most</h3>
                  <p className="text-sm text-warm-gray max-w-sm">Track views, favorites, and downloads. Turn engagement into new bookings.</p>
                </div>
                <div className="w-full md:w-72 h-32 bg-white rounded-2xl p-4 flex items-end gap-1.5 ring-1 ring-border">
                  {[40, 60, 90, 50, 70, 85, 95].map((h, i) => (
                    <div key={i} className={`flex-1 ${i === 6 ? "bg-emerald" : "bg-emerald/25"} rounded-t-md`} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zigzag showcase */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 space-y-28">
          <ZigzagRow
            tag="Weddings"
            tagColor="bg-emerald-light text-emerald"
            title="A digital heirloom for the modern couple"
            body="Our wedding websites are more than galleries. They are living archives of one of life's most beautiful chapters."
            bullets={["Elegant editorial typography", "Password-protected galleries", "Direct high-res downloads"]}
            image={PHOTOS.weddingDetails}
            rotation="rotate-2"
          />
          <ZigzagRow
            reverse
            tag="Concerts & Festivals"
            tagColor="bg-lavender text-foreground"
            title="Energy captured, shared instantly"
            body="High-energy event photography becomes interactive portfolios fans explore while the music is still ringing."
            bullets={["Live publishing during the event", "Fan-favoriting & social sharing", "Tens of thousands of photos, zero friction"]}
            image={PHOTOS.concertCrowd}
            rotation="-rotate-2"
            quote={{ text: "DearMemory changed how we handle festival delivery. 10,000 photos, zero friction.", studio: "Noise & Light Studio" }}
          />
          <ZigzagRow
            tag="Graduations"
            tagColor="bg-sky text-foreground"
            title="A milestone every family can keep"
            body="Beautiful class galleries with face-find search so every family lands on their student in one tap."
            bullets={["Smart class & section grouping", "Print store ready", "Trusted by 200+ schools"]}
            image={PHOTOS.graduation}
            rotation="rotate-1"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald mb-3">How it works</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">From event to experience in minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { n: "01", t: "Create Event", d: "Pick an event type — wedding, concert, anything." },
              { n: "02", t: "Choose Template", d: "Visual gallery of award-level themes." },
              { n: "03", t: "Upload Photos", d: "Drag, drop, done. We handle the rest." },
              { n: "04", t: "Customize", d: "Colors, fonts, animations — all yours." },
              { n: "05", t: "Publish", d: "Instant website, custom domain ready." },
            ].map((s) => (
              <div key={s.n} className="bg-white rounded-[2rem] p-6 ring-1 ring-border hover:-translate-y-1 transition-transform">
                <div className="font-mono text-emerald text-sm mb-4">{s.n}</div>
                <div className="font-bold mb-2">{s.t}</div>
                <div className="text-sm text-warm-gray">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event types */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-emerald mb-3">Every kind of event</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight max-w-lg">From intimate to unforgettable</h2>
            </div>
            <Link to="/templates" className="text-sm font-semibold text-emerald hover:underline">
              Browse all templates →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {EVENT_TYPES.map((t) => (
              <div key={t.type} className={`${t.color} rounded-3xl p-6 aspect-square flex flex-col justify-between hover:-translate-y-1 transition-transform cursor-pointer`}>
                <div className="text-3xl">{t.emoji}</div>
                <div>
                  <div className="font-bold">{t.type}</div>
                  <div className="text-[11px] text-warm-gray mt-1">{t.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template strip */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Templates that feel like memories</h2>
            <p className="text-warm-gray">Each one designed with the emotion of the event in mind.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEMPLATES.slice(0, 4).map((t) => (
              <div key={t.id} className="bg-white rounded-[2rem] overflow-hidden ring-1 ring-border hover:-translate-y-1 transition-transform">
                <img src={t.cover} alt={t.name} className="aspect-[4/5] w-full object-cover" />
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-widest text-warm-gray font-bold mb-1">{t.category}</div>
                  <div className="font-bold">{t.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald mb-3">Loved by studios</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">More bookings. Better client experiences.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.studio} className="bg-cream rounded-[2rem] p-8 flex flex-col justify-between">
                <p className="text-lg leading-relaxed font-serif italic">"{t.text}"</p>
                <div className="mt-8">
                  <div className="font-bold">{t.studio}</div>
                  <div className="text-xs text-warm-gray">{t.name} · {t.city}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-24 bg-emerald-light/40">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Simple, studio-friendly pricing</h2>
          <p className="text-warm-gray max-w-md mx-auto mb-12">Start free. Upgrade when your clients fall in love with their galleries.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm text-left ring-1 ring-border">
              <div className="text-sm font-bold uppercase tracking-widest text-warm-gray mb-2">The Creative</div>
              <div className="text-5xl font-bold mb-4">$29<span className="text-base font-normal text-warm-gray">/mo</span></div>
              <p className="text-sm text-warm-gray mb-8">Perfect for independent photographers and small studios.</p>
              <Link to="/pricing" className="block w-full text-center py-4 rounded-full border-2 border-emerald text-emerald font-bold hover:bg-emerald/5 transition-colors">
                Start Trial
              </Link>
            </div>
            <div className="bg-emerald p-10 rounded-[2.5rem] shadow-xl text-left text-white">
              <div className="text-sm font-bold uppercase tracking-widest text-white/60 mb-2">The Agency</div>
              <div className="text-5xl font-bold mb-4">$89<span className="text-base font-normal text-white/60">/mo</span></div>
              <p className="text-sm text-white/80 mb-8">For high-volume studios and event production teams.</p>
              <Link to="/pricing" className="block w-full text-center py-4 rounded-full bg-white text-emerald font-bold hover:bg-cream transition-colors">
                See full pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function ZigzagRow({
  tag, tagColor, title, body, bullets, image, rotation, reverse, quote,
}: {
  tag: string; tagColor: string; title: string; body: string; bullets: string[];
  image: string; rotation: string; reverse?: boolean;
  quote?: { text: string; studio: string };
}) {
  return (
    <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 md:gap-16`}>
      <div className="flex-1">
        <div className={`inline-block px-3 py-1 rounded-full ${tagColor} text-[10px] font-bold uppercase tracking-widest mb-4`}>{tag}</div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 max-w-lg">{title}</h2>
        <p className="text-warm-gray mb-8 max-w-md">{body}</p>
        <ul className="space-y-3 text-sm font-medium mb-6">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald/10 flex items-center justify-center text-emerald text-xs">✓</div>
              {b}
            </li>
          ))}
        </ul>
        {quote && (
          <div className="bg-cream p-5 rounded-3xl border border-border max-w-md">
            <p className="text-sm italic text-warm-gray mb-3">"{quote.text}"</p>
            <div className="text-xs font-bold">{quote.studio}</div>
          </div>
        )}
      </div>
      <div className="flex-1 w-full">
        <div className={`rounded-[2.5rem] overflow-hidden shadow-2xl ${rotation}`}>
          <img src={image} alt={title} className="aspect-[4/5] w-full object-cover" />
        </div>
      </div>
    </div>
  );
}

function BrowserMockup() {
  return (
    <div className="bg-white">
      <div className="bg-cream px-4 py-3 flex items-center gap-2 border-b border-border">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald/60" />
        <div className="ml-4 text-[11px] text-warm-gray font-mono">goldenhour.dearmemory.com</div>
      </div>
      <div className="grid grid-cols-3 gap-1 p-1 bg-white">
        <img src={PHOTOS.weddingHero} className="aspect-square object-cover" alt="" />
        <img src={PHOTOS.weddingFlowers} className="aspect-square object-cover row-span-2 h-full" alt="" />
        <img src={PHOTOS.weddingDetails} className="aspect-square object-cover" alt="" />
        <img src={PHOTOS.weddingDance} className="aspect-square object-cover" alt="" />
        <img src={PHOTOS.weddingCouple} className="aspect-square object-cover" alt="" />
      </div>
    </div>
  );
}

function QRGlyph() {
  return (
    <div className="grid grid-cols-5 gap-0.5 w-14 h-14">
      {Array.from({ length: 25 }).map((_, i) => {
        const filled = [0, 1, 2, 5, 7, 10, 11, 13, 16, 18, 20, 22, 23, 24, 4, 8, 14].includes(i);
        return <div key={i} className={`rounded-[2px] ${filled ? "bg-foreground" : "bg-transparent"}`} />;
      })}
    </div>
  );
}
