import { createFileRoute, Link } from "@tanstack/react-router";
import { type ElementType, type ReactNode, useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  ImageIcon,
  Eye,
  Sparkles,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { eventsAPI, analyticsAPI, getToken, getUserIdFromToken, getMediaUrl } from "@/lib/api/client";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — DearMemory" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [traffic, setTraffic] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError("Not authenticated");
          return;
        }

        const userId = getUserIdFromToken();

        const [eventsData, statsData, trafficData] = await Promise.all([
          eventsAPI.list(),
          analyticsAPI.dashboard(Number(userId)),
          analyticsAPI.eventTraffic(Number(userId), 7),
        ]);

        setEvents(eventsData || []);
        setStats(statsData);
        setTraffic(trafficData?.daily_breakdown || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate values from real data
  const publishedEvents = events.filter((event) => event.status === "Live").length;
  const totalViews = stats?.total_views || 0;
  const totalVisitors = stats?.total_visitors || 0;
  
  const maxTraffic = Math.max(...traffic.map((x: any) => x.views || 0), 1);
  const TRAFFIC_BARS = traffic.slice(-7).map((item: any) => ({
    day: new Date(item.day).toLocaleDateString(undefined, { weekday: "short" }),
    height: `${Math.max(8, ((item.views || 0) / maxTraffic) * 100)}%`,
    views: item.views || 0,
  }));

  if (loading) {
    return (
      <AppShell
        title="Dashboard"
        subtitle="Loading..."
      >
        <div className="text-center py-12">Loading dashboard data...</div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell
        title="Dashboard"
        subtitle="Error"
      >
        <div className="text-center py-12 text-red-600">{error}</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Welcome back"
      subtitle="A quick read on the stories your studio is shaping today."
      action={
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-[#e0dbd4] px-4 py-2 text-[13.5px] font-medium text-[#2d2a29] hover:bg-[#f4f1eb] transition-colors">
            <CalendarDays size={15} strokeWidth={1.6} className="text-[#7a7470]" />
            View calendar
          </button>
          <Link
            to="/dashboard/events/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4A7C6A] px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-[#3d6b5a] transition-colors"
          >
            Create story
            <ArrowRight size={15} strokeWidth={1.6} />
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        <section className="grid grid-cols-1 gap-5">
          <div className="bg-white rounded-2xl border border-[#e8e4de] p-5">
            <div className="text-[16px] font-semibold tracking-[-0.015em] text-[#1c1a18]">
              At a glance
            </div>
            <p className="mt-0.5 text-[13px] text-[#a09c98]">
              A compact summary of the studio's current momentum.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label="Active events"
                value={events.length.toString()}
                delta="+3 this month"
                deltaTone="positive"
                accent="emerald"
                icon={CalendarDays}
              />
              <StatCard
                label="Published stories"
                value={publishedEvents.toString()}
                delta="Ready for sharing"
                deltaTone="neutral"
                accent="stone"
                icon={Sparkles}
              />
              <StatCard
                label="Gallery views"
                value={totalViews.toLocaleString()}
                delta="+18% this week"
                deltaTone="positive"
                accent="warning"
                icon={Eye}
              />
              <StatCard
                label="Guest visits"
                value={totalVisitors.toLocaleString()}
                delta="Across all live stories"
                deltaTone="neutral"
                accent="neutral"
                icon={Users}
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
          <div className="bg-white rounded-2xl border border-[#e8e4de] p-6">
            <SectionHeader
              title="Traffic this week"
              subtitle="All event websites and story pages"
              action={<Link to="/dashboard/analytics" className="inline-flex items-center justify-center rounded-xl bg-white border border-[#e0dbd4] px-4 py-2 text-[13.5px] font-medium text-[#2d2a29] hover:bg-[#f4f1eb] transition-colors">View details</Link>}
            />

            <div className="mt-6 flex items-end gap-3 h-44">
              {TRAFFIC_BARS.map((bar, index) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full h-40 rounded-t-2xl bg-[#edf4f1] flex items-end overflow-hidden">
                    <div className="w-full rounded-t-2xl bg-[#4A7C6A]" style={{ height: bar.height }} />
                  </div>
                  <div className="text-[11.5px] font-medium uppercase tracking-wide text-[#a09c98]">
                    {bar.day}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 h-px bg-[#e8e4de]" />

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricPill label="Peak day" value="Saturday" />
              <MetricPill label="Top page" value="Festival story" />
              <MetricPill label="Growth" value="+18.2%" tone="positive" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e4de] p-6">
            <SectionHeader title="Recent activity" subtitle="How people are engaging with the stories" />
            <div className="mt-4 space-y-0">
              {/* TODO: Fetch from API when activity endpoint is ready */}
              <div className="text-center py-8 text-[#a09c98]">No activity yet</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-5">
          <div className="bg-white rounded-2xl border border-[#e8e4de] p-6">
            <SectionHeader
              title="Story queue"
              subtitle="The next experiences ready to be refined"
              action={<Link to="/dashboard/events" className="inline-flex items-center justify-center rounded-xl bg-white border border-[#e0dbd4] px-4 py-2 text-[13.5px] font-medium text-[#2d2a29] hover:bg-[#f4f1eb] transition-colors">Open all</Link>}
            />

            <div className="mt-4 space-y-3">
              {events.slice(0, 4).map((event) => (
                <Link
                  key={event.id}
                  to="/dashboard/events/$id"
                  params={{ id: event.id }}
                  className="group flex items-center gap-4 rounded-2xl border border-[#e8e4de] p-3 hover:shadow-[0_2px_12px_rgba(45,42,41,0.07)] transition-shadow"
                >
                  <img src={event.cover_image ? getMediaUrl(event.cover_image) : "/placeholder.png"} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold tracking-[-0.01em] text-[#2d2a29] truncate">
                      {event.title}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#7a7470] truncate">{event.date}</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-right">
                    <div>
                      <div className="text-[14px] font-semibold tracking-[-0.01em] text-[#1c1a18]">
                        {event.views.toLocaleString()}
                      </div>
                      <div className="text-[11.5px] font-medium uppercase tracking-wide text-[#a09c98]">
                        Views
                      </div>
                    </div>
                    <ArrowRight size={15} strokeWidth={1.6} className="text-[#7a7470] group-hover:text-[#4A7C6A] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e4de] p-6">
            <SectionHeader title="Pinned memories" subtitle="A quiet place for the moments you want to surface later" />
            <div className="mt-4">
              <EmptyState
                icon={ImageIcon}
                title="Your first pinned memory is waiting to be chosen."
                body="Pin a standout story, gallery, or event so it stays within easy reach while you work."
                actionLabel="Choose a memory"
              />
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}


function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-5">
      <div>
        <h2 className="text-[16px] font-semibold tracking-[-0.015em] text-[#1c1a18]">
          {title}
        </h2>
        {subtitle && <p className="text-[13px] text-[#a09c98] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  deltaTone,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone: "positive" | "neutral" | "negative";
  accent: "emerald" | "stone" | "warning" | "neutral";
  icon: ElementType;
}) {
  const accentStyles = {
    emerald: {
      card: "bg-[#edf4f1] border-[#dcebe5]",
      chip: "bg-white/70 text-[#4A7C6A]",
      value: "text-[#1c1a18]",
      label: "text-[#3d6b5a]",
    },
    stone: {
      card: "bg-[#f4f1eb] border-[#e8e4de]",
      chip: "bg-white/70 text-[#7a7470]",
      value: "text-[#2d2a29]",
      label: "text-[#7a7470]",
    },
    warning: {
      card: "bg-[#f0ece8] border-[#ddd6cd]",
      chip: "bg-white/75 text-[#d4802a]",
      value: "text-[#1c1a18]",
      label: "text-[#a46a18]",
    },
    neutral: {
      card: "bg-[#faf8f5] border-[#e8e4de]",
      chip: "bg-white/70 text-[#a09c98]",
      value: "text-[#1c1a18]",
      label: "text-[#a09c98]",
    },
  }[accent];

  const deltaClass =
    deltaTone === "positive"
      ? "text-[#4A7C6A]"
      : deltaTone === "negative"
        ? "text-[#c0392b]"
        : "text-[#7a7470]";

  return (
    <div className={`rounded-2xl border p-5 ${accentStyles.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`text-[12px] uppercase tracking-widest font-medium ${accentStyles.label}`}>
            {label}
          </div>
          <div className={`mt-3 text-[28px] font-bold tracking-[-0.03em] ${accentStyles.value}`}>
            {value}
          </div>
        </div>
        <div className={`h-9 w-9 rounded-xl grid place-items-center ${accentStyles.chip}`}>
          <Icon size={15} strokeWidth={1.6} />
        </div>
      </div>
      <div className={`mt-3 text-[12px] ${deltaClass}`}>{delta}</div>
    </div>
  );
}

function MetricPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive";
}) {
  return (
    <div className="rounded-2xl border border-[#f0ece8] bg-white p-4">
      <div className="text-[11.5px] font-medium uppercase tracking-wide text-[#a09c98]">
        {label}
      </div>
      <div className={`mt-2 text-[14px] font-semibold tracking-[-0.01em] ${tone === "positive" ? "text-[#4A7C6A]" : "text-[#2d2a29]"}`}>
        {value}
      </div>
    </div>
  );
}

function ActivityRow({
  item,
}: {
  item: {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
  };
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#f0ece8] last:border-0">
      <div className="w-7 h-7 rounded-full bg-[#edf4f1] grid place-items-center shrink-0 mt-0.5">
        <Heart size={13} strokeWidth={1.8} className="text-[#4A7C6A]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] text-[#2d2a29] leading-relaxed">
          <span className="font-semibold">{item.user}</span> {item.action} <span className="font-semibold">{item.target}</span>
        </p>
        <p className="text-[12px] text-[#a09c98] mt-0.5">{item.time}</p>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  actionLabel,
}: {
  icon: ElementType;
  title: string;
  body: string;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#f4f1eb] grid place-items-center mb-4">
        <Icon size={20} strokeWidth={1.4} className="text-[#b0aaa6]" />
      </div>
      <p className="text-[14px] font-semibold text-[#2d2a29] mb-1">{title}</p>
      <p className="text-[13px] text-[#a09c98] mb-5 max-w-[260px] leading-relaxed">{body}</p>
      <button className="inline-flex items-center justify-center rounded-xl bg-[#4A7C6A] px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-[#3d6b5a] transition-colors">
        {actionLabel}
      </button>
    </div>
  );
}
