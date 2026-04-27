import React from 'react';
import { useQuery } from '@apollo/client/react';
import { Activity, Eye, Users, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { ANALYTICS_STATS } from '../../lib/queries';

// ── Types ─────────────────────────────────────────────────────────────────────
interface PageViewStat  { page: string; views: number; }
interface DailyViews    { date: string; views: number; }
interface AnalyticsData {
  analyticsStats: {
    totalViews:     number;
    uniqueSessions: number;
    avgDurationSec: number | null;
    topPages:       PageViewStat[];
    viewsLast7Days: DailyViews[];
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDuration(sec: number | null): string {
  if (sec === null || sec === 0) return '—';
  if (sec < 60) return `${Math.round(sec)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatDate(iso: string): string {
  // "2025-03-15" → "Mar 15"
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function pageLabel(path: string): string {
  if (path === '/') return 'Home';
  return path.replace(/^\//, '').replace(/-/g, ' ');
}

// ── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}
function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="bg-[#0F1A08] border border-[#D4AF37]/15 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[#D4AF37]/60 text-xs font-semibold uppercase tracking-widest">{label}</span>
        <span className="text-[#D4AF37]/40">{icon}</span>
      </div>
      <p className="text-white text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>{value}</p>
      {sub && <p className="text-[#F5F0E8]/40 text-xs">{sub}</p>}
    </div>
  );
}

// ── Mini bar chart (pure CSS/SVG — no external library needed) ────────────────
function BarChart({ data }: { data: DailyViews[] }) {
  const max = Math.max(...data.map(d => d.views), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {data.map((d) => {
        const pct = max === 0 ? 0 : (d.views / max) * 100;
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex flex-col justify-end" style={{ height: '80px' }}>
              {/* Tooltip */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1A2E10] border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {d.views} view{d.views !== 1 ? 's' : ''}
              </div>
              <div
                className="w-full rounded-t bg-[#D4AF37]/70 group-hover:bg-[#D4AF37] transition-all duration-200"
                style={{ height: `${Math.max(pct, d.views > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span className="text-[#F5F0E8]/30 text-[9px] leading-none">{formatDate(d.date)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Top pages list ────────────────────────────────────────────────────────────
function TopPages({ pages, total }: { pages: PageViewStat[]; total: number }) {
  return (
    <div className="space-y-3">
      {pages.length === 0 && (
        <p className="text-[#F5F0E8]/30 text-sm">No data yet.</p>
      )}
      {pages.map((p) => {
        const pct = total === 0 ? 0 : Math.round((p.views / total) * 100);
        return (
          <div key={p.page}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#F5F0E8]/80 text-sm capitalize">{pageLabel(p.page)}</span>
              <span className="text-[#D4AF37] text-sm font-semibold">{p.views} <span className="text-[#F5F0E8]/30 font-normal text-xs">({pct}%)</span></span>
            </div>
            <div className="w-full h-1.5 bg-[#D4AF37]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4AF37]/60 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export const AdminAnalytics: React.FC = () => {
  const { data, loading, error, refetch } = useQuery<AnalyticsData>(ANALYTICS_STATS, {
    fetchPolicy: 'cache-and-network',
  });

  const stats = data?.analyticsStats;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Site Analytics
          </h1>
          <p className="text-[#F5F0E8]/40 text-sm mt-1">Who's visiting and how long they stay</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm">
          Failed to load analytics: {error.message}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#0F1A08] border border-[#D4AF37]/10 rounded-2xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      )}

      {/* Stat cards */}
      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Eye size={16} />}
              label="Total views"
              value={stats.totalViews.toLocaleString()}
              sub="All time page views"
            />
            <StatCard
              icon={<Users size={16} />}
              label="Unique visitors"
              value={stats.uniqueSessions.toLocaleString()}
              sub="Distinct browser sessions"
            />
            <StatCard
              icon={<Clock size={16} />}
              label="Avg. time on page"
              value={formatDuration(stats.avgDurationSec)}
              sub="Across all visits"
            />
            <StatCard
              icon={<Activity size={16} />}
              label="Last 7 days"
              value={stats.viewsLast7Days.reduce((s, d) => s + d.views, 0).toLocaleString()}
              sub="Recent traffic"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Bar chart */}
            <div className="bg-[#0F1A08] border border-[#D4AF37]/15 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={15} className="text-[#D4AF37]/60" />
                <h2 className="text-[#F5F0E8]/70 text-sm font-semibold">Views — last 7 days</h2>
              </div>
              {stats.viewsLast7Days.length > 0
                ? <BarChart data={stats.viewsLast7Days} />
                : <p className="text-[#F5F0E8]/30 text-sm">No data yet.</p>
              }
            </div>

            {/* Top pages */}
            <div className="bg-[#0F1A08] border border-[#D4AF37]/15 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Eye size={15} className="text-[#D4AF37]/60" />
                <h2 className="text-[#F5F0E8]/70 text-sm font-semibold">Top pages (all time)</h2>
              </div>
              <TopPages pages={stats.topPages} total={stats.totalViews} />
            </div>
          </div>

          {/* Empty state hint */}
          {stats.totalViews === 0 && (
            <div className="bg-[#0F1A08] border border-[#D4AF37]/15 rounded-2xl p-8 text-center">
              <Activity size={32} className="text-[#D4AF37]/30 mx-auto mb-3" />
              <p className="text-[#F5F0E8]/60 text-sm">No visits recorded yet.</p>
              <p className="text-[#F5F0E8]/30 text-xs mt-1">
                Data will appear here as people visit the public site.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};