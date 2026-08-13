// import { Link, useRouterState } from "@tanstack/react-router";
// import { useState, useEffect, type ReactNode } from "react";
// import {
//   LayoutDashboard,
//   CalendarDays,
//   Layers,
//   BookImage,
//   Image,
//   Briefcase,
//   BarChart2,
//   Palette,
//   Users,
//   Settings,
//   Menu,
//   X,
// } from "lucide-react";

// import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// import { studioAPI, authAPI , getMediaUrl} from "@/lib/api/client";

// // ─── Nav structure ────────────────────────────────────────────────────────────

// const NAV_GROUPS: {
//   items: { label: string; href: string; icon: React.ElementType }[];
// }[] = [
//   {
//     items: [
//       { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//       { label: "Events", href: "/dashboard/events", icon: CalendarDays },
//       { label: "Create", href: "/dashboard/create", icon: Layers },
//       { label: "Albums", href: "/dashboard/albums", icon: BookImage },
//       { label: "Media Library", href: "/dashboard/media", icon: Image },
//     ],
//   },
//   {
//     items: [
//       { label: "Studio Portfolio", href: "/dashboard/portfolio", icon: Briefcase },
//       { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
//       { label: "Leads & CRM", href: "/dashboard/leads", icon: Users },
//       { label: "Brand Kit", href: "/dashboard/brand", icon: Palette },
//     ],
//   },
//   {
//     items: [
//       { label: "Leads & CRM", href: "/dashboard/team", icon: Users },
//       { label: "Settings", href: "/dashboard/settings", icon: Settings },
//     ],
//   },
// ];

// // ─── Wordmark ─────────────────────────────────────────────────────────────────

// function Wordmark() {
//   return (
//     <Link
//       to="/"
//       className="flex items-baseline gap-[2px] text-[17px] tracking-[-0.02em] select-none"
//     >
//       <span className="font-normal text-[#2d2a29]">dear</span>
//       <span className="font-semibold text-[#4A7C6A]">memory</span>
//     </Link>
//   );
// }

// // ─── Nav item ─────────────────────────────────────────────────────────────────

// function NavItem({
//   item,
//   active,
//   onClick,
// }: {
//   item: { label: string; href: string; icon: React.ElementType };
//   active: boolean;
//   onClick?: () => void;
// }) {
//   const Icon = item.icon;
//   return (
//     <a
//       href={item.href}
//       onClick={onClick}
//       className={[
//         "group relative flex items-center gap-3 rounded-xl px-3 py-[9px] text-[13.5px] transition-colors duration-150",
//         active
//           ? "text-[#2d2a29] font-[540]"
//           : "text-[#7a7470] font-normal hover:text-[#2d2a29] hover:bg-[#f4f1eb]/70",
//       ].join(" ")}
//     >
//       {/* Active bar — the signature element */}
//       {active && (
//         <span
//           aria-hidden
//           className="absolute inset-y-[6px] left-0 w-[2.5px] rounded-full bg-[#4A7C6A]"
//         />
//       )}
//       <Icon
//         size={15}
//         strokeWidth={active ? 2 : 1.6}
//         className={
//           active ? "text-[#4A7C6A]" : "text-[#b0aaa6] group-hover:text-[#7a7470] transition-colors"
//         }
//       />
//       {item.label}
//     </a>
//   );
// }

// // ─── Sidebar nav ──────────────────────────────────────────────────────────────

// function SidebarNav({
//   isActive,
//   onNav,
// }: {
//   isActive: (href: string) => boolean;
//   onNav?: () => void;
// }) {
//   return (
//     <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
//       {NAV_GROUPS.map((group, gi) => (
//         <div key={gi}>
//           {gi > 0 && <div aria-hidden className="my-2 mx-3 h-px bg-[#e8e4de]" />}
//           {group.items.map((item) => (
//             <NavItem key={item.href} item={item} active={isActive(item.href)} onClick={onNav} />
//           ))}
//         </div>
//       ))}
//     </nav>
//   );
// }

// // ─── Studio identity row ──────────────────────────────────────────────────────

// function initialsOf(name: string | undefined | null): string {
//   if (!name) return "?";
//   const parts = name.trim().split(/\s+/).filter(Boolean);
//   if (parts.length === 0) return "?";
//   if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
//   return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
// }

// function StudioRow() {
//   const [studio, setStudio] = useState<any>(null);
//   const [user, setUser] = useState<any>(null);
//   const [loaded, setLoaded] = useState(false);

//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       try {
//         const [studioData, userData] = await Promise.allSettled([
//           studioAPI.getMe(),
//           authAPI.getCurrentUser(),
//         ]);
//         if (cancelled) return;
//         if (studioData.status === "fulfilled") setStudio(studioData.value);
//         if (userData.status === "fulfilled") setUser(userData.value);
//       } finally {
//         if (!cancelled) setLoaded(true);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const displayName = user?.full_name || user?.username || "";
//   const studioName = studio?.name || (loaded ? "Set up your studio" : "");

//   return (
//     <div className="px-4 pb-5 pt-3 flex items-center gap-3">
//       {/* Studio brand logo — falls back to initials while there's no logo set */}
//       <div
//         className="w-8 h-8 rounded-full bg-[#e8e4de] shrink-0 grid place-items-center text-[11px] font-semibold tracking-wide text-[#5c5753] overflow-hidden"
//         aria-hidden
//       >
//         {studio?.logo ? (
//           <img
//             src={getMediaUrl(studio.logo)}
//             alt=""
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           initialsOf(studioName || displayName)
//         )}
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="text-[13px] font-semibold text-[#2d2a29] truncate leading-snug">
//           {displayName || "\u00A0"}
//         </p>
//         <p className="text-[11.5px] text-[#a09c98] truncate leading-snug">
//           {studioName || "\u00A0"}
//         </p>
//       </div>
//     </div>
//   );
// }

// // ─── AppShell ─────────────────────────────────────────────────────────────────

// export function AppShell({
//   children,
//   title,
//   subtitle,
//   action,
//   headerTabs,
//   hideSidebar,
// }: {
//   children: ReactNode;
//   title?: string;
//   subtitle?: string;
//   action?: ReactNode;
//   headerTabs?: { label: string; active?: boolean }[];
//   hideSidebar?: boolean;
// }) {
//   const pathname = useRouterState({ select: (s) => s.location.pathname });

//   const isActive = (href: string) =>
//     href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

//   return (
//     <div className="min-h-screen bg-[#f0ece4]">
//       <div className="relative flex min-h-screen bg-[#faf8f5] shadow-[0_8px_48px_rgba(45,42,41,0.10)] md:m-4 md:rounded-[22px] overflow-hidden">
//         {!hideSidebar && (
//           <aside className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-[#e8e4de] h-[calc(100vh-2rem)] sticky top-4 bg-[#faf8f5]">
//             <div className="px-5 py-5">
//               <Wordmark />
//             </div>

//             <SidebarNav isActive={isActive} />

//             {/* Divider before studio row */}
//             <div className="mx-4 h-px bg-[#e8e4de]" />
//             <StudioRow />
//           </aside>
//         )}

//         {/* ── Main ─────────────────────────────────────────────────────────── */}
//         <main className="flex-1 min-w-0 flex flex-col">
//           {/* Header */}
//           <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-7 md:px-9 py-5 bg-[#faf8f5] border-b border-[#e8e4de]">
//             <div className="flex items-center gap-4 min-w-0">
//               {/* Mobile menu */}
//               <div className="md:hidden">
//                 <Sheet>
//                   <SheetTrigger asChild>
//                     <button
//                       type="button"
//                       aria-label="Open menu"
//                       className="h-9 w-9 grid place-items-center rounded-xl border border-[#e0dbd4] bg-white text-[#7a7470] hover:bg-[#f4f1eb] transition-colors"
//                     >
//                       <Menu size={17} strokeWidth={1.7} />
//                     </button>
//                   </SheetTrigger>
//                   <SheetContent
//                     side="left"
//                     className="w-72 bg-[#faf8f5] border-r border-[#e8e4de] flex flex-col p-0"
//                   >
//                     {/* visually hidden title for a11y */}
//                     <SheetTitle className="sr-only">Navigation</SheetTitle>

//                     <div className="px-5 py-5 flex items-center justify-between">
//                       <Wordmark />
//                     </div>
//                     <div className="flex-1 overflow-y-auto">
//                       <SidebarNav isActive={isActive} />
//                     </div>
//                     <div className="mx-4 h-px bg-[#e8e4de]" />
//                     <StudioRow />
//                   </SheetContent>
//                 </Sheet>
//               </div>

//               {/* Page title */}
//               <div className="min-w-0">
//                 {headerTabs ? (
//                   <div className="flex gap-1 bg-cream rounded-full p-1">
//                     {headerTabs.map((tab, i) => (
//                       <button
//                         key={tab.label}
//                         className={`flex-1 text-xs font-semibold py-1.5 rounded-full ${tab.active ? "bg-white shadow" : "text-warm-gray"}`}
//                       >
//                         {tab.label}
//                       </button>
//                     ))}
//                   </div>
//                 ) : (
//                   <>
//                     <h1 className="text-lg md:text-xl font-semibold tracking-[-0.025em] text-[#1c1a18] leading-tight truncate">
//                       {title}
//                     </h1>
//                     {subtitle && (
//                       <p className="text-[13px] text-[#a09c98] mt-0.5 leading-snug">{subtitle}</p>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>

//             {action && <div className="shrink-0">{action}</div>}
//           </header>

//           {/* Page content */}
//           <div className="flex-1 px-7 md:px-9 py-8">{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// }

import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Layers,
  BookImage,
  Image,
  Briefcase,
  BarChart2,
  Palette,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { studioAPI, authAPI , getMediaUrl} from "@/lib/api/client";

// ─── Nav structure ────────────────────────────────────────────────────────────

const NAV_GROUPS: {
  items: { label: string; href: string; icon: React.ElementType }[];
}[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Events", href: "/dashboard/events", icon: CalendarDays },
      { label: "Create", href: "/dashboard/create", icon: Layers },
      { label: "Albums", href: "/dashboard/albums", icon: BookImage },
      { label: "Media Library", href: "/dashboard/media", icon: Image },
    ],
  },
  {
    items: [
      { label: "Studio Portfolio", href: "/dashboard/portfolio", icon: Briefcase },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
      { label: "Brand Kit", href: "/dashboard/brand", icon: Palette },
    ],
  },
  {
    items: [
      { label: "Leads & CRM", href: "/dashboard/team", icon: Users },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

// ─── Wordmark ─────────────────────────────────────────────────────────────────

function Wordmark() {
  return (
    <Link
      to="/"
      className="flex items-baseline gap-[2px] text-[17px] tracking-[-0.02em] select-none"
    >
      <span className="font-normal text-[#2d2a29]">dear</span>
      <span className="font-semibold text-[#4A7C6A]">memory</span>
    </Link>
  );
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({
  item,
  active,
  onClick,
}: {
  item: { label: string; href: string; icon: React.ElementType };
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      onClick={onClick}
      className={[
        "group relative flex items-center gap-3 rounded-xl px-3 py-[9px] text-[13.5px] transition-colors duration-150",
        active
          ? "text-[#2d2a29] font-[540]"
          : "text-[#7a7470] font-normal hover:text-[#2d2a29] hover:bg-[#f4f1eb]/70",
      ].join(" ")}
    >
      {/* Active bar — the signature element */}
      {active && (
        <span
          aria-hidden
          className="absolute inset-y-[6px] left-0 w-[2.5px] rounded-full bg-[#4A7C6A]"
        />
      )}
      <Icon
        size={15}
        strokeWidth={active ? 2 : 1.6}
        className={
          active ? "text-[#4A7C6A]" : "text-[#b0aaa6] group-hover:text-[#7a7470] transition-colors"
        }
      />
      {item.label}
    </a>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

function SidebarNav({
  isActive,
  onNav,
}: {
  isActive: (href: string) => boolean;
  onNav?: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi}>
          {gi > 0 && <div aria-hidden className="my-2 mx-3 h-px bg-[#e8e4de]" />}
          {group.items.map((item) => (
            <NavItem key={item.href} item={item} active={isActive(item.href)} onClick={onNav} />
          ))}
        </div>
      ))}
    </nav>
  );
}

// ─── Studio identity row ──────────────────────────────────────────────────────

function initialsOf(name: string | undefined | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Fetches the logged-in studio's brand data + user once, shared by the top brand
 * badge and the bottom identity row so both stay in sync and we don't double-fetch. */
function useStudioIdentity() {
  const [studio, setStudio] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [studioData, userData] = await Promise.allSettled([
          studioAPI.getMe(),
          authAPI.getCurrentUser(),
        ]);
        if (cancelled) return;
        if (studioData.status === "fulfilled") setStudio(studioData.value);
        if (userData.status === "fulfilled") setUser(userData.value);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { studio, user, loaded };
}

// ─── Studio brand badge — top-left, below the platform wordmark ───────────────
// This is the STUDIO's own logo + name (from Brand Kit), distinct from the
// "dearmemory" platform wordmark above it.

function StudioBrandBadge({ studio, loaded }: { studio: any; loaded: boolean }) {
  const studioName = studio?.name || (loaded ? "Set up your studio" : "");

  if (loaded && !studio) {
    return (
      <Link
        to="/dashboard/brand"
        className="mx-5 mb-1 flex items-center gap-2 rounded-xl px-2.5 py-2 text-[12px] text-[#a09c98] hover:text-[#4A7C6A] hover:bg-[#f4f1eb]/70 transition-colors"
      >
        <div className="w-6 h-6 rounded-lg border border-dashed border-[#d8d3cc] shrink-0" />
        Add your studio logo
      </Link>
    );
  }

  return (
    <div className="mx-5 mb-1 flex items-center gap-2.5 px-2.5 py-2">
      <div
        className="w-7 h-7 rounded-lg bg-[#e8e4de] shrink-0 grid place-items-center text-[10px] font-bold tracking-wide text-[#5c5753] overflow-hidden"
        aria-hidden
      >
        {studio?.logo ? (
          <img
            src={getMediaUrl(studio.logo)}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          initialsOf(studioName)
        )}
      </div>
      <span className="text-[13px] font-semibold text-[#2d2a29] truncate leading-snug">
        {studioName || "\u00A0"}
      </span>
    </div>
  );
}

// ─── Studio identity row (bottom of sidebar) ───────────────────────────────────

function StudioRow({ studio, user, loaded }: { studio: any; user: any; loaded: boolean }) {
  const displayName = user?.full_name || user?.username || "";
  const studioName = studio?.name || (loaded ? "Set up your studio" : "");

  return (
    <div className="px-4 pb-5 pt-3 flex items-center gap-3">
      {/* Studio brand logo — falls back to initials while there's no logo set */}
      <div
        className="w-8 h-8 rounded-full bg-[#e8e4de] shrink-0 grid place-items-center text-[11px] font-semibold tracking-wide text-[#5c5753] overflow-hidden"
        aria-hidden
      >
        {studio?.logo ? (
          <img
            src={getMediaUrl(studio.logo)}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          initialsOf(studioName || displayName)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#2d2a29] truncate leading-snug">
          {displayName || "\u00A0"}
        </p>
        <p className="text-[11.5px] text-[#a09c98] truncate leading-snug">
          {studioName || "\u00A0"}
        </p>
      </div>
    </div>
  );
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell({
  children,
  title,
  subtitle,
  action,
  headerTabs,
  hideSidebar,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  headerTabs?: { label: string; active?: boolean }[];
  hideSidebar?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { studio, user, loaded } = useStudioIdentity();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#f0ece4]">
      <div className="relative flex min-h-screen bg-[#faf8f5] shadow-[0_8px_48px_rgba(45,42,41,0.10)] md:m-4 md:rounded-[22px] overflow-hidden">
        {!hideSidebar && (
          <aside className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-[#e8e4de] h-[calc(100vh-2rem)] sticky top-4 bg-[#faf8f5]">
            <div className="px-5 py-5">
              <Wordmark />
            </div>
            <StudioBrandBadge studio={studio} loaded={loaded} />
            <div className="mx-4 mb-2 h-px bg-[#e8e4de]" />

            <SidebarNav isActive={isActive} />

            {/* Divider before studio row */}
            <div className="mx-4 h-px bg-[#e8e4de]" />
            <StudioRow studio={studio} user={user} loaded={loaded} />
          </aside>
        )}

        {/* ── Main ─────────────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-7 md:px-9 py-5 bg-[#faf8f5] border-b border-[#e8e4de]">
            <div className="flex items-center gap-4 min-w-0">
              {/* Mobile menu */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label="Open menu"
                      className="h-9 w-9 grid place-items-center rounded-xl border border-[#e0dbd4] bg-white text-[#7a7470] hover:bg-[#f4f1eb] transition-colors"
                    >
                      <Menu size={17} strokeWidth={1.7} />
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-72 bg-[#faf8f5] border-r border-[#e8e4de] flex flex-col p-0"
                  >
                    {/* visually hidden title for a11y */}
                    <SheetTitle className="sr-only">Navigation</SheetTitle>

                    <div className="px-5 py-5 flex items-center justify-between">
                      <Wordmark />
                    </div>
                    <StudioBrandBadge studio={studio} loaded={loaded} />
                    <div className="mx-4 mb-2 h-px bg-[#e8e4de]" />
                    <div className="flex-1 overflow-y-auto">
                      <SidebarNav isActive={isActive} />
                    </div>
                    <div className="mx-4 h-px bg-[#e8e4de]" />
                    <StudioRow studio={studio} user={user} loaded={loaded} />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Page title */}
              <div className="min-w-0">
                {headerTabs ? (
                  <div className="flex gap-1 bg-cream rounded-full p-1">
                    {headerTabs.map((tab, i) => (
                      <button
                        key={tab.label}
                        className={`flex-1 text-xs font-semibold py-1.5 rounded-full ${tab.active ? "bg-white shadow" : "text-warm-gray"}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <h1 className="text-lg md:text-xl font-semibold tracking-[-0.025em] text-[#1c1a18] leading-tight truncate">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-[13px] text-[#a09c98] mt-0.5 leading-snug">{subtitle}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {action && <div className="shrink-0">{action}</div>}
          </header>

          {/* Page content */}
          <div className="flex-1 px-7 md:px-9 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}