import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app/AppShell";
import { analyticsAPI, eventsAPI, photosAPI, getUserIdFromToken , getMediaUrl} from "@/lib/api/client";
import { TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({ meta: [{ title: "Analytics — DearMemory" }] }),
  component: Analytics,
});

function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [traffic, setTraffic] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const userId = getUserIdFromToken();
        if (!userId) {
          setError("Please log in first");
          return;
        }

        const dashboardData = await analyticsAPI.dashboard(userId);
        setAnalytics(dashboardData);
        const trafficData = await analyticsAPI.eventTraffic(userId, timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 90);
        setTraffic(trafficData?.daily_breakdown || []);

        const eventsData = await eventsAPI.list();
        setEvents(eventsData || []);

        const allPhotos: any[] = [];
        if (eventsData && eventsData.length > 0) {
          for (const event of eventsData) {
            const eventPhotos = await photosAPI.list(event.id);
            if (eventPhotos) {
              allPhotos.push(...eventPhotos);
            }
          }
        }
        setPhotos(allPhotos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Get date range based on timeRange selection
  const getDateRange = (range: string) => {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setFullYear(2000);
    }

    return startDate;
  };

  // Filter data by time range
  const getFilteredData = () => {
    const startDate = getDateRange(timeRange);
    const filteredEvents = events.filter(
      (e) => new Date(e.created_at) >= startDate
    );
    const filteredPhotos = photos.filter(
      (p) => new Date(p.created_at) >= startDate
    );
    return { filteredEvents, filteredPhotos };
  };

  // Get previous period data for trend calculation
  const getPreviousPeriodData = () => {
    const currentRange = getDateRange(timeRange);
    const days = Math.ceil(
      (new Date().getTime() - currentRange.getTime()) / (1000 * 60 * 60 * 24)
    );
    const prevStartDate = new Date(currentRange.getTime() - days * 24 * 60 * 60 * 1000);

    const prevEvents = events.filter(
      (e) =>
        new Date(e.created_at) >= prevStartDate &&
        new Date(e.created_at) < currentRange
    );
    const prevPhotos = photos.filter(
      (p) =>
        new Date(p.created_at) >= prevStartDate &&
        new Date(p.created_at) < currentRange
    );

    return { prevEvents, prevPhotos };
  };

  const { filteredEvents, filteredPhotos } = getFilteredData();
  const { prevEvents, prevPhotos } = getPreviousPeriodData();

  const stats = {
    events: filteredEvents.length,
    photos: filteredPhotos.length,
    views: filteredEvents.reduce((sum: number, e: any) => sum + (e.views || 0), 0),
    favorites: filteredPhotos.reduce((sum: number, p: any) => sum + (p.favorites || 0), 0),
    downloads: filteredPhotos.reduce((sum: number, p: any) => sum + (p.downloads || 0), 0),
  };

  const prevStats = {
    events: prevEvents.length,
    photos: prevPhotos.length,
    views: prevEvents.reduce((sum: number, e: any) => sum + (e.views || 0), 0),
    favorites: prevPhotos.reduce((sum: number, p: any) => sum + (p.favorites || 0), 0),
    downloads: prevPhotos.reduce((sum: number, p: any) => sum + (p.downloads || 0), 0),
  };

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { change: 0, isUp: true };
    const change = ((current - previous) / previous) * 100;
    return { change: Math.abs(change), isUp: current >= previous };
  };

  // Get top performing photos
  const topPhotos = [...filteredPhotos]
    .sort((a, b) => (b.favorites || 0) + (b.downloads || 0) - ((a.favorites || 0) + (a.downloads || 0)))
    .slice(0, 5);

  const TRAFFIC_BARS = traffic.slice(-7).map((item: any) => ({
    date: new Date(item.day).toLocaleDateString(undefined, { weekday: "short" }),
    views: item.views,
    label: String(item.views),
  }));

  if (loading) {
    return (
      <AppShell title="Analytics" subtitle="Your performance metrics">
        <div className="text-center py-12">Loading analytics...</div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Analytics" subtitle="Your performance metrics">
        <div className="text-center py-12 text-red-600">{error}</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Analytics"
      subtitle="Your performance metrics"
      action={
        <div className="flex gap-2">
          {["7d", "30d", "90d", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                timeRange === range
                  ? "bg-emerald text-white"
                  : "bg-white ring-1 ring-border text-warm-gray hover:bg-cream"
              }`}
            >
              {range === "all" ? "All time" : `Last ${range}`}
            </button>
          ))}
        </div>
      }
    >
      {/* Key Metrics with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Events", value: stats.events, icon: "📷", metric: "events" },
          { label: "Photos", value: stats.photos, icon: "🖼️", metric: "photos" },
          { label: "Gallery Views", value: stats.views.toLocaleString(), icon: "👁️", metric: "views" },
          { label: "Favorites", value: stats.favorites, icon: "❤️", metric: "favorites" },
          { label: "Downloads", value: stats.downloads, icon: "⬇️", metric: "downloads" },
        ].map((metric) => {
          const trend = calculateTrend(stats[metric.metric as keyof typeof stats], prevStats[metric.metric as keyof typeof prevStats]);
          
          return (
            <div key={metric.label} className="bg-white rounded-xl ring-1 ring-border p-4">
              <div className="text-2xl mb-2">{metric.icon}</div>
              <div className="text-2xl font-bold text-emerald">{metric.value}</div>
              
              {/* Trend Indicator */}
              <div className="flex items-center gap-1 mt-2">
                {trend.change > 0 && (
                  <>
                    {trend.isUp ? (
                      <TrendingUp size={14} className="text-green-500" />
                    ) : (
                      <TrendingDown size={14} className="text-red-500" />
                    )}
                    <span className={`text-xs font-semibold ${trend.isUp ? "text-green-500" : "text-red-500"}`}>
                      {trend.isUp ? "+" : "-"}{trend.change.toFixed(0)}%
                    </span>
                  </>
                )}
              </div>
              
              <div className="text-xs text-emerald uppercase tracking-widest mt-2 font-semibold">
                {metric.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Traffic Chart */}
        <div className="bg-white rounded-2xl ring-1 ring-border p-6">
          <h3 className="font-bold text-lg mb-6">Gallery Traffic (Last 7 Days)</h3>
          <div className="flex items-end justify-between h-48 gap-3">
            {TRAFFIC_BARS.map((bar) => (
              <div
                key={bar.date}
                className="flex-1 flex flex-col items-center gap-3"
              >
                <div className="text-xs text-emerald font-semibold">{bar.label}</div>
                <div
                  className="w-full bg-emerald rounded-t-md transition-all hover:bg-emerald-deep cursor-pointer"
                  style={{ height: `${Math.min(100, Math.max(0, (bar.views / Math.max(...TRAFFIC_BARS.map(x => x.views), 1)) * 100))}%`, minHeight: "20px" }}
                />
                <span className="text-xs text-warm-gray font-semibold">{bar.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Chart */}
        <div className="bg-white rounded-2xl ring-1 ring-border p-6">
          <h3 className="font-bold text-lg mb-6">Engagement</h3>
          <div className="space-y-4">
            {[
              { label: "Favorites", value: stats.favorites, max: 100, color: "text-red-500" },
              { label: "Downloads", value: stats.downloads, max: 100, color: "text-emerald" },
              { label: "Gallery Views", value: Math.min(stats.views, 1000), max: 1000, color: "text-emerald" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-warm-gray">{item.label}</span>
                  <span className={`text-sm font-bold ${item.color}`}>
                    {item.value.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.label === "Favorites"
                        ? "bg-red-500"
                        : "bg-emerald"
                    }`}
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Photos */}
      {topPhotos.length > 0 && (
        <div className="bg-white rounded-2xl ring-1 ring-border p-6 mb-8">
          <h3 className="font-bold text-lg mb-6">Top Performing Photos</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {topPhotos.map((photo) => (
              <div key={photo.id} className="group">
                <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-200">
                  <img
                    src={getMediaUrl(photo.url)}
                    alt={photo.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-warm-gray">❤️</span>
                    <span className="font-semibold text-emerald">{photo.favorites || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-warm-gray">⬇️</span>
                    <span className="font-semibold text-emerald">{photo.downloads || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Events */}
      <div className="bg-white rounded-2xl ring-1 ring-border p-6">
        <h3 className="font-bold text-lg mb-6">Recent Events</h3>
        {filteredEvents.length === 0 ? (
          <p className="text-warm-gray text-center py-8">No events in this period</p>
        ) : (
          <div className="space-y-4">
            {filteredEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-warm-gray">{event.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald">{event.views || 0} views</p>
                  <p className="text-sm text-warm-gray">
                    {new Date(event.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}


// import { createFileRoute } from "@tanstack/react-router";
// import { AppShell } from "@/components/app/AppShell";
// import { ANALYTICS_TRAFFIC, EVENTS } from "@/lib/mock/data";

// export const Route = createFileRoute("/dashboard/analytics")({
//   head: () => ({ meta: [{ title: "Analytics — DearMemory" }] }),
//   component: Analytics,
// });

// const DEVICES = [
//   { l: "Mobile", v: 58, c: "bg-emerald" },
//   { l: "Desktop", v: 31, c: "bg-lavender" },
//   { l: "Tablet", v: 11, c: "bg-sky" },
// ];

// function Analytics() {
//   return (
//     <AppShell title="Analytics" subtitle="Last 7 days · All event websites">
//       <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
//         {[
//           { l: "Views", v: "24.8k", d: "+18%" },
//           { l: "Visitors", v: "5,471", d: "+12%" },
//           { l: "Downloads", v: "1,204", d: "+24%" },
//           { l: "Shares", v: "412", d: "+9%" },
//           { l: "Favorites", v: "2,810", d: "+31%" },
//         ].map((m) => (
//           <div key={m.l} className="bg-white rounded-[1.5rem] p-5 ring-1 ring-border">
//             <div className="text-xs font-bold uppercase tracking-widest text-warm-gray mb-2">{m.l}</div>
//             <div className="text-3xl font-bold font-mono text-emerald">{m.v}</div>
//             <div className="text-[11px] text-warm-gray mt-2">{m.d}</div>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//         <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 ring-1 ring-border">
//           <div className="font-bold mb-6">Traffic over time</div>
//           <div className="flex items-end gap-4 h-64">
//             {ANALYTICS_TRAFFIC.map((d, i) => {
//               const max = Math.max(...ANALYTICS_TRAFFIC.map((x) => x.views));
//               return (
//                 <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
//                   <div className="w-full flex flex-col gap-1 items-stretch h-full justify-end">
//                     <div className={`${i === 5 ? "bg-emerald" : "bg-emerald/30"} rounded-t-xl`} style={{ height: `${(d.views / max) * 100}%` }} />
//                     <div className="bg-emerald/10 rounded-b-xl" style={{ height: `${(d.visitors / max) * 100}%` }} />
//                   </div>
//                   <div className="text-[10px] font-bold uppercase text-warm-gray">{d.day}</div>
//                 </div>
//               );
//             })}
//           </div>
//           <div className="flex gap-4 mt-6 text-xs">
//             <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald rounded-sm" /> Views</div>
//             <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald/10 rounded-sm" /> Visitors</div>
//           </div>
//         </div>

//         <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border">
//           <div className="font-bold mb-6">Device analytics</div>
//           <div className="space-y-4">
//             {DEVICES.map((s) => (
//               <div key={s.l}>
//                 <div className="flex justify-between text-sm mb-2"><span>{s.l}</span><span className="font-mono text-warm-gray">{s.v}%</span></div>
//                 <div className="h-2 bg-cream rounded-full overflow-hidden">
//                   <div className={`${s.c} h-full rounded-full`} style={{ width: `${s.v}%` }} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-[2rem] p-6 ring-1 ring-border">
//         <div className="font-bold mb-4">Most viewed events</div>
//         <div className="space-y-3">
//           {EVENTS.slice(0, 5).sort((a, b) => b.views - a.views).map((e, i) => (
//             <div key={e.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-cream">
//               <div className="font-mono text-warm-gray w-6 text-sm">{i + 1}</div>
//               <img src={e.cover} alt="" className="w-12 h-12 rounded-xl object-cover" />
//               <div className="flex-1 min-w-0">
//                 <div className="font-semibold truncate">{e.title}</div>
//                 <div className="text-xs text-warm-gray">{e.type}</div>
//               </div>
//               <div className="font-mono text-emerald text-sm">{e.views.toLocaleString()}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </AppShell>
//   );
// }
