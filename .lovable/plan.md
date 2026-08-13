## DearMemory — Full UI Prototype Plan

A design-only build (no backend yet) of the DearMemory platform using the **Heirloom Collage** direction as the visual foundation: warm cream `#EEEAFE` background, soft emerald `#4A7C6A` primary, sky `#E1F0F7` and lavender `#E6E1F2` accents, Plus Jakarta Sans display + JetBrains Mono for stat counters, large rounded corners (2–3rem), gentle fade-up motion.

### Design system (src/styles.css)
Port the prototype's tokens verbatim — emerald / emerald-light / sky / lavender / warm-gray / cream background, Plus Jakarta Sans + JetBrains Mono loaded via `<link>` in `__root.tsx`, `fade-up` keyframe, soft shadow + ring utilities. Wire shadcn semantic tokens (`--primary`, `--secondary`, `--accent`, `--muted`) to map onto the DearMemory palette so every shadcn component inherits the look. All radii bumped up.

### Phase 1 — Public marketing site
Routes under `src/routes/`:
- `index.tsx` — landing page, ported faithfully from the chosen direction (nav, layered-collage hero, social proof counters, bento feature grid, zigzag showcase, simple pricing, footer). Real generated event imagery (wedding / graduation / concert) replaces the placeholders. Adds: "How it works" 5-step flow, testimonials row, additional template strip — all in the same heirloom-collage language.
- `templates.tsx` — public template gallery (Timeless Romance, Golden Memories, Forever Begins, Grand Celebration, Modern Elegance, Festival Vibes, Legacy Collection) as large rounded preview cards.
- `pricing.tsx` — expanded pricing with feature comparison.
- `studio/$slug.tsx` — sample public studio portfolio page (hero banner, about, team, portfolio showcase, packages, reviews, trust counters, contact + instant quote form).
- `event/$slug.tsx` — sample public event website (one of the templates rendered with mock photos, guestbook, QR share, downloads).

Each route gets its own `head()` with route-specific title / description / og tags.

### Phase 2 — Dashboard (app shell)
All under `_app` layout route `src/routes/_app.tsx` with a collapsible left sidebar (shadcn sidebar, soft cream surface, emerald active state, rounded pill nav items):

Sidebar items: Dashboard, Events, Templates, Website Builder, Albums, Media Library, Leads & Quotes, Studio Portfolio, Analytics, Brand Kit, Team, Settings.

Routes:
- `_app.dashboard.tsx` — visual metric cards (Active Events, New Leads, Visitors, Quote Requests, Photos Uploaded, Revenue), recent activity feed, upcoming events, top performing events, quick actions.
- `_app.events.index.tsx` — card-based event grid (cover, title, date, views, visitors, status, quick actions).
- `_app.events.new.tsx` — 5-step event creation wizard (Event Type → Template → Upload Media → Customize → Publish) with progress rail.
- `_app.events.$id.tsx` — single event detail with tabs.
- `_app.templates.tsx` — internal template marketplace.
- `_app.builder.tsx` — website builder shell: left panel (Sections / Pages / Templates / Assets), center live preview frame, right panel (Typography / Colors / Spacing / Animation / Layout) with mock controls and undo/redo + responsive toggle in toolbar.
- `_app.albums.index.tsx` + `_app.albums.$id.tsx` — album designer: cover, chapter sections, layout presets (magazine / collage / timeline / full-width hero), preview pane, PDF/Print export buttons.
- `_app.media.tsx` — media library grid with drag-drop affordance.
- `_app.leads.tsx` — lead/quote kanban + table with status, source, response tracking, follow-up reminders, conversion rate.
- `_app.portfolio.tsx` — studio portfolio editor (sections list + live preview).
- `_app.analytics.tsx` — visual analytics (views, visitors, downloads, shares, favorites, most viewed events, traffic sources) using Recharts in emerald palette.
- `_app.brand.tsx` — brand kit (logo upload, color picker, font picker, watermark, asset library).
- `_app.team.tsx` — team members table.
- `_app.settings.tsx` — settings tabs.

### Phase 3 — Polish pass
- Generate ~10 hero/event/template images via imagegen (weddings, graduations, concerts, celebrations) and replace every placeholder.
- Add fade-up scroll animations and hover lift across cards.
- Mobile responsive sweep on landing + dashboard.
- SEO metadata per public route.

### Technical notes
- TanStack Start routing, file-based. `__root.tsx` injects fonts via `head().links`. App shell uses `_app` pathless layout with `<Outlet />`.
- All data is mock data in `src/lib/mock/*.ts` (events, leads, templates, analytics, studio profile). No Lovable Cloud, no auth — every protected screen is reachable directly for prototype review.
- shadcn components (button, card, dialog, tabs, sidebar, dropdown, chart) restyled via tokens, not ad-hoc class overrides.
- One header check: replace the placeholder in `src/routes/index.tsx` first to clear the blank-app state.

### Out of scope (for now)
- Real auth, real uploads, real publishing, real analytics, payments, custom domains, PDF export. All buttons that would hit a backend show a toast or open a styled mock dialog.

### Suggested build order
1. Design tokens + fonts + landing page (Phase 1 home + footer/nav).
2. Other marketing routes (templates, pricing, sample studio, sample event).
3. App shell + dashboard home + events list/create.
4. Builder + albums + media + leads.
5. Analytics + brand + team + settings + portfolio editor.
6. Image generation + responsive + polish.

This is large — expect to ship it in multiple turns. The first turn will deliver the design system + landing page + nav/footer + at least one secondary marketing route so you can validate the look before the dashboard work begins.