/**
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 * Meet HaSammie Suah — Stats Dashboard
 * Replaces: src/components/StatsSection.tsx
 *
 * What's here:
 *  1. Headline stat cards (pulls from useSite() — same as before, fully backward compatible)
 *  2. 100m progression chart  — canvas line chart, scroll-triggered draw
 *  3. Season comparison bars  — best 100m time per season, animated on scroll
 *  4. Event breakdown chart   — horizontal bars for 60m / 100m / 200m PRs
 *  5. Meets-won trend         — small sparkline by season
 *  6. Quote banner            — preserved from original
 *
 * Drop into: src/components/StatsSection.tsx  (replace the existing file)
 * No changes needed in HomePage.tsx or anywhere else — it's a drop-in swap.
 *
 * All chart data is defined as static constants at the top of the file.
 * When Sammie's results are stored in the database (via the race results
 * feature), replace these with live GraphQL data.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Zap, TrendingDown, BarChart2, Activity } from 'lucide-react';
import { useSite } from '../context/SiteContext';

// ─── Chart data ───────────────────────────────────────────────────────────────
// Replace with live data from GraphQL / useSite() when race results are wired up.

const PROGRESSION_100M = [
  { label: "Apr '23", time: 12.35, meet: 'Freshman Debut'           },
  { label: "Apr '23", time: 12.14, meet: 'District Championship'    },
  { label: "May '23", time: 12.10, meet: 'State Championships'      },
  { label: "Mar '24", time: 11.96, meet: 'Spring Opener'            },
  { label: "Apr '24", time: 11.88, meet: 'Regional Qualifier'       },
  { label: "May '24", time: 11.84, meet: 'State Championships'      },
  { label: "Mar '25", time: 11.91, meet: 'Green Country Invite'     },
  { label: "Apr '25", time: 11.80, meet: 'Tulsa Invitational — PR'  },
];

const SEASON_BESTS = [
  { season: '2023', best: 12.10, color: '#7A9B00' },
  { season: '2024', best: 11.84, color: '#D4AF37' },
  { season: '2025', best: 11.80, color: '#9AB800' },
];

const EVENT_PRS = [
  { event: '100m', pr: '11.80s', pct: 94, color: '#D4AF37', note: 'Wind-legal +0.2 m/s' },
  { event: '200m', pr: '24.30s', pct: 88, color: '#9AB800', note: '' },
  { event: '60m',  pr: '7.61s',  pct: 82, color: '#7A9B00', note: 'Indoor — Feb 2025' },
];

const MEETS_WON = [
  { season: '2023', won: 2 },
  { season: '2024', won: 5 },
  { season: '2025', won: 5 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useScrollReveal(threshold = 0.2) {
  const ref     = useRef<HTMLDivElement>(null);
  const [prog, setProg] = useState(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let target = 0;
    let current = 0;

    const obs = new IntersectionObserver(
      ([entry]) => { target = entry.isIntersecting ? 1 : 0; },
      { threshold: Array.from({ length: 11 }, (_, i) => i / 10) }
    );
    obs.observe(el);

    const tick = () => {
      current += (target - current) * 0.05;
      setProg(easeOut(Math.min(1, current)));
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    return () => { obs.disconnect(); cancelAnimationFrame(animRef.current); };
  }, []);

  return { ref, prog };
}

// ─── Progression line chart ───────────────────────────────────────────────────

const ProgressionChart: React.FC<{ progress: number }> = ({ progress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const [hovered, setHovered] = useState<number | null>(null);

  const draw = useCallback((prog: number, hovIdx: number | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = canvas.offsetWidth;
    const h   = canvas.offsetHeight;
    if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const PAD = { l: 44, r: 16, t: 20, b: 36 };
    const gw  = w - PAD.l - PAD.r;
    const gh  = h - PAD.t - PAD.b;

    const times  = PROGRESSION_100M.map(d => d.time);
    const minT   = Math.min(...times) - 0.06;
    const maxT   = Math.max(...times) + 0.06;
    const toX    = (i: number) => PAD.l + (i / (PROGRESSION_100M.length - 1)) * gw;
    const toY    = (v: number) => PAD.t + gh - ((v - minT) / (maxT - minT)) * gh;
    const pts    = PROGRESSION_100M.map((d, i) => ({ x: toX(i), y: toY(d.time), d }));

    // Grid
    ctx.strokeStyle = 'rgba(212,175,55,0.08)';
    ctx.lineWidth   = 0.5;
    for (let g = 0; g <= 4; g++) {
      const y = PAD.t + (g / 4) * gh;
      ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(w - PAD.r, y); ctx.stroke();
      const v = maxT - (g / 4) * (maxT - minT);
      ctx.fillStyle   = 'rgba(212,175,55,0.3)';
      ctx.font        = '9px DM Sans, sans-serif';
      ctx.textAlign   = 'right';
      ctx.fillText(v.toFixed(2) + 's', PAD.l - 4, y + 3);
    }

    // X labels
    ctx.fillStyle = 'rgba(245,240,232,0.3)';
    ctx.font      = '9px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < pts.length; i++) {
      if (i % 2 === 0 || i === pts.length - 1) {
        ctx.fillText(PROGRESSION_100M[i].label, pts[i].x, PAD.t + gh + 18);
      }
    }

    const lineEnd = prog * (PROGRESSION_100M.length - 1);

    // Fill under line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i <= Math.floor(lineEnd); i++) ctx.lineTo(pts[i].x, pts[i].y);
    if (lineEnd % 1 > 0) {
      const fi = Math.floor(lineEnd), fr = lineEnd % 1;
      const nx = Math.min(fi + 1, pts.length - 1);
      ctx.lineTo(pts[fi].x + (pts[nx].x - pts[fi].x) * fr, pts[fi].y + (pts[nx].y - pts[fi].y) * fr);
    }
    const ex = lineEnd < PROGRESSION_100M.length - 1
      ? pts[Math.floor(lineEnd)].x + (pts[Math.min(Math.floor(lineEnd) + 1, pts.length - 1)].x - pts[Math.floor(lineEnd)].x) * (lineEnd % 1)
      : pts[pts.length - 1].x;
    ctx.lineTo(ex, PAD.t + gh);
    ctx.lineTo(pts[0].x, PAD.t + gh);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + gh);
    grad.addColorStop(0, 'rgba(212,175,55,0.18)');
    grad.addColorStop(1, 'rgba(212,175,55,0.0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i <= Math.floor(lineEnd); i++) ctx.lineTo(pts[i].x, pts[i].y);
    if (lineEnd % 1 > 0) {
      const fi = Math.floor(lineEnd), fr = lineEnd % 1;
      const nx = Math.min(fi + 1, pts.length - 1);
      ctx.lineTo(pts[fi].x + (pts[nx].x - pts[fi].x) * fr, pts[fi].y + (pts[nx].y - pts[fi].y) * fr);
    }
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Dots + hover tooltip
    const now = Date.now();
    for (let i = 0; i < PROGRESSION_100M.length; i++) {
      if (i > lineEnd) break;
      const p    = pts[i];
      const isPR = i === PROGRESSION_100M.length - 1;

      if (isPR) {
        const pulse = (now / 1200) % 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 8 + pulse * 12, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(154,184,0,${(1 - pulse) * 0.5})`; ctx.lineWidth = 1.5; ctx.stroke();
      }

      if (hovIdx === i) {
        ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212,175,55,0.2)'; ctx.fill();
      }

      ctx.beginPath(); ctx.arc(p.x, p.y, isPR ? 5 : hovIdx === i ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isPR ? '#9AB800' : hovIdx === i ? '#F5E070' : '#D4AF37';
      ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0F1A08'; ctx.fill();

      if (hovIdx === i) {
        // Tooltip
        const label  = `${p.d.time}s — ${p.d.meet}`;
        ctx.font     = '500 11px DM Sans, sans-serif';
        const tw     = ctx.measureText(label).width + 16;
        const tx     = Math.min(Math.max(p.x - tw / 2, 4), w - tw - 4);
        const ty     = Math.max(p.y - 36, 4);
        ctx.fillStyle   = 'rgba(26,45,10,0.95)';
        ctx.strokeStyle = 'rgba(212,175,55,0.35)';
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.roundRect(tx, ty, tw, 22, 6);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = isPR ? '#9AB800' : '#D4AF37';
        ctx.textAlign = 'left';
        ctx.fillText(label, tx + 8, ty + 14);
      }
    }
  }, []);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const loop = () => { draw(progress, hovered); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [progress, hovered, draw]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect  = canvas.getBoundingClientRect();
    const mx    = e.clientX - rect.left;
    const gw    = canvas.offsetWidth - 60;
    const idx   = Math.round((mx - 44) / gw * (PROGRESSION_100M.length - 1));
    setHovered(Math.max(0, Math.min(PROGRESSION_100M.length - 1, idx)));
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full cursor-crosshair"
      style={{ height: 180, display: 'block' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHovered(null)}
    />
  );
};

// ─── Season best bars ─────────────────────────────────────────────────────────

const SeasonBars: React.FC<{ progress: number }> = ({ progress }) => {
  const minTime = Math.min(...SEASON_BESTS.map(s => s.best));
  const maxTime = Math.max(...SEASON_BESTS.map(s => s.best));
  const range   = maxTime - minTime;

  return (
    <div className="space-y-4">
      {SEASON_BESTS.map((s, i) => {
        const barWidth = progress * (1 - (s.best - minTime) / (range + 0.2));
        const pct      = Math.round(barWidth * 100);
        return (
          <div key={s.season}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-[#F5F0E8]/60 text-xs font-semibold">{s.season} Season</span>
              </div>
              <span className="font-mono text-sm font-bold" style={{ color: s.color }}>
                {s.best}s
              </span>
            </div>
            <div className="h-8 bg-[#0F1A08]/60 rounded-xl overflow-hidden border border-[#D4AF37]/8">
              <div
                className="h-full rounded-xl flex items-center justify-end px-3 transition-none"
                style={{
                  width: `${Math.max(pct, 10)}%`,
                  background: `linear-gradient(90deg, ${s.color}40, ${s.color}90)`,
                  transition: 'width 0.05s linear',
                }}
              >
                {pct > 30 && (
                  <span className="text-[#0F1A08] text-[10px] font-black">{s.best}s</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <p className="text-[#F5F0E8]/25 text-xs pt-1">Bars scaled to range — lower is faster</p>
    </div>
  );
};

// ─── Event PR horizontal bars ─────────────────────────────────────────────────

const EventBars: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="space-y-5">
    {EVENT_PRS.map((e) => (
      <div key={e.event}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-black text-white">{e.event}</span>
            {e.note && <span className="text-[#F5F0E8]/30 text-[10px]">{e.note}</span>}
          </div>
          <span className="font-mono text-base font-bold" style={{ color: e.color }}>{e.pr}</span>
        </div>
        <div className="h-3 bg-[#0F1A08]/60 rounded-full overflow-hidden border border-[#D4AF37]/8">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * e.pct}%`,
              background: `linear-gradient(90deg, ${e.color}50, ${e.color})`,
              transition: 'width 0.05s linear',
            }}
          />
        </div>
      </div>
    ))}
    <p className="text-[#F5F0E8]/25 text-xs pt-1">Bars show relative performance across events</p>
  </div>
);

// ─── Meets-won sparkline ──────────────────────────────────────────────────────

const MeetSparkline: React.FC<{ progress: number }> = ({ progress }) => {
  const max  = Math.max(...MEETS_WON.map(m => m.won));
  const total = MEETS_WON.reduce((s, m) => s + m.won, 0);

  return (
    <div>
      <div className="flex items-end gap-3 h-24 mb-3">
        {MEETS_WON.map((m, i) => {
          const h = (m.won / max) * 100;
          return (
            <div key={m.season} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[#D4AF37] text-xs font-bold">{m.won}</span>
              <div
                className="w-full rounded-t-lg transition-none"
                style={{
                  height: `${progress * h}%`,
                  background: i === MEETS_WON.length - 1
                    ? 'linear-gradient(180deg, #9AB800, #7A9B00)'
                    : `linear-gradient(180deg, rgba(212,175,55,${0.4 + i * 0.2}), rgba(212,175,55,${0.2 + i * 0.15}))`,
                  transition: 'height 0.05s linear',
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-3">
        {MEETS_WON.map(m => (
          <div key={m.season} className="flex-1 text-center text-[#F5F0E8]/35 text-[10px]">{m.season}</div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-[#D4AF37]/10 flex items-center justify-between">
        <span className="text-[#F5F0E8]/35 text-xs">Career victories</span>
        <span className="font-display text-xl font-black text-[#D4AF37]">{total}+</span>
      </div>
    </div>
  );
};

// ─── Chart card wrapper ───────────────────────────────────────────────────────

const ChartCard: React.FC<{
  icon:     React.ReactNode;
  title:    string;
  subtitle: string;
  children: React.ReactNode;
  span?:    'full' | 'half';
}> = ({ icon, title, subtitle, children, span }) => (
  <div className={`bg-[#1a2d0a]/40 border border-[#D4AF37]/12 rounded-2xl p-6 ${span === 'full' ? 'lg:col-span-2' : ''}`}>
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]/70">
        {icon}
      </div>
      <div>
        <h3 className="text-white text-sm font-semibold leading-tight">{title}</h3>
        <p className="text-[#F5F0E8]/35 text-xs">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

// ─── Main section ─────────────────────────────────────────────────────────────

export const StatsSection: React.FC = () => {
  const { data } = useSite();
  const { ref, prog } = useScrollReveal(0.15);

  return (
    <section id="stats" className="relative py-24 overflow-hidden" ref={ref as React.RefObject<HTMLElement>}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1405] via-[#111a07] to-[#0a1405]" />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 border-r border-[#D4AF37]"
            style={{ left: `${(i + 1) * 16.666}%` }} />
        ))}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#D4AF37]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center mb-16 anim-fade-up">
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">The Numbers Speak</p>
          <h2 className="font-display text-5xl sm:text-6xl font-black text-white">
            By the <span className="text-shimmer">Stats</span>
          </h2>
        </div>

        {/* ── Headline stat cards (from admin) ─────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 mb-12">
          {data.stats.map((stat, i) => (
            <div
              key={stat.label}
              className="group relative bg-[#1a2d0a]/40 border border-[#D4AF37]/20 rounded-3xl p-6 sm:p-8 hover:border-[#D4AF37]/50 hover:bg-[#1a2d0a]/70 transition-all duration-300 overflow-hidden cursor-default opacity-0 anim-fade-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <Zap size={16} className="text-[#D4AF37]/40 mt-1" />
                  <span className="text-[#D4AF37]/30 text-xs font-mono">#{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white group-hover:text-[#D4AF37] transition-colors duration-300 mb-1">
                  {stat.value}
                </div>
                {stat.unit && <div className="text-[#D4AF37]/60 text-xs font-bold tracking-widest uppercase mb-2">{stat.unit}</div>}
                <div className="text-[#F5F0E8]/50 text-xs sm:text-sm leading-tight">{stat.label}</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* ── Improvement callout ──────────────────────────────────────────── */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#9AB800]/10 border border-[#9AB800]/25 anim-fade-up delay-3">
            <TrendingDown size={16} className="text-[#9AB800]" />
            <span className="text-[#9AB800] font-bold text-sm">−0.55s in 100m</span>
            <span className="text-[#F5F0E8]/35 text-xs">across 2 seasons · 8 timed 100m efforts</span>
          </div>
        </div>

        {/* ── Chart grid ───────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* 100m Progression — full width */}
          <ChartCard
            icon={<Activity size={15} />}
            title="100m progression"
            subtitle="Every timed 100m effort — hover to inspect"
            span="full"
          >
            <ProgressionChart progress={prog} />
          </ChartCard>

          {/* Season bests */}
          <ChartCard
            icon={<BarChart2 size={15} />}
            title="Season bests — 100m"
            subtitle="Best time per season"
          >
            <SeasonBars progress={prog} />
          </ChartCard>

          {/* Event PRs */}
          <ChartCard
            icon={<Zap size={15} />}
            title="Personal records by event"
            subtitle="Current PRs across all sprint events"
          >
            <EventBars progress={prog} />
          </ChartCard>

          {/* Meets won */}
          <ChartCard
            icon={<TrendingDown size={15} />}
            title="Meets won by season"
            subtitle="First-place finishes per season"
          >
            <MeetSparkline progress={prog} />
          </ChartCard>

        </div>

        {/* ── Quote banner (preserved from original) ───────────────────────── */}
        <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2d5016] via-[#1a3008] to-[#2d5016] border border-[#D4AF37]/30 p-8">
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute bottom-0 border-r border-[#D4AF37]"
                style={{ left: `${i * 5.3}%`, height: `${30 + Math.random() * 70}%` }} />
            ))}
          </div>
          <div className="relative z-10 text-center">
            <p className="font-accent text-2xl sm:text-3xl text-[#D4AF37] italic mb-2">
              "The track doesn't lie — and neither do these numbers."
            </p>
            <p className="text-[#F5F0E8]/40 text-sm">Sammie Suah · Union High School · Tulsa, Oklahoma</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default StatsSection;
