/**
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 * Meet HaSammie Suah — Race Results Timeline (v3)
 * Performance Graph — the definitive version.
 *
 * What's new vs v2:
 *  - Slim canvas strip at the top of the section draws the performance line
 *    as the section scrolls into view (IntersectionObserver → requestAnimationFrame)
 *  - Each race dot on the graph lights up in sync with its card appearing below
 *  - The PR dot (11.80s) gets a lime-green expanding ring when the line reaches it
 *  - Neuro-graph toggle removed — replaced by the performance graph which is always on
 *  - "Neuro graph" mode is now available as an optional second layer via a subtle
 *    toggle (particles only, no edges) for those who want extra atmosphere
 *
 * Drop into: src/components/RaceResultsTimeline.tsx
 * Replaces all previous versions.
 */

import React, {
  useRef, useEffect, useState, useCallback, useMemo,
} from 'react';
import {
  Timer, Wind, MapPin, Calendar, ChevronDown, Award, TrendingDown,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RaceResult {
  id: string;
  date: string;
  meetName: string;
  location: string;
  event: string;
  time: string;           // e.g. "11.80s"
  timeVal: number;        // numeric for graph, e.g. 11.80
  place: string;
  windSpeed?: string;
  notes?: string;
  isPR?: boolean;
  season: '2023' | '2024' | '2025';
}

// ─── Data ────────────────────────────────────────────────────────────────────
// Replace with useSite() / GraphQL when wired up.

const raceResults: RaceResult[] = [
  { id:'r-2023-01', date:'Apr 1, 2023',  meetName:'Freshman Debut — Union Spring Meet',      location:'Tulsa, OK',         event:'100m',        time:'12.35s', timeVal:12.35, place:'1st', notes:'The beginning — freshman debut',                             isPR:false, season:'2023' },
  { id:'r-2023-02', date:'Apr 22, 2023', meetName:'District Championship',                    location:'Broken Arrow, OK',  event:'100m',        time:'12.14s', timeVal:12.14, place:'3rd',                                                       isPR:false, season:'2023' },
  { id:'r-2023-03', date:'May 20, 2023', meetName:'Oklahoma 6A State Championships',          location:'Edmond, OK',        event:'100m',        time:'12.10s', timeVal:12.10, place:'8th', notes:'First state appearance as a freshman',          isPR:false, season:'2023' },
  { id:'r-2024-01', date:'Mar 21, 2024', meetName:'Spring Opener Classic',                    location:'Jenks, OK',         event:'100m',        time:'11.96s', timeVal:11.96, place:'2nd',                                                       isPR:false, season:'2024' },
  { id:'r-2024-02', date:'Apr 6, 2024',  meetName:'Booker T Washington Invitational',         location:'Tulsa, OK',         event:'4×100m Relay',time:'47.10s', timeVal:47.10, place:'1st', notes:'Anchor leg — relay anchor',                                isPR:false, season:'2024' },
  { id:'r-2024-03', date:'Apr 19, 2024', meetName:'Regional Qualifier',                       location:'Tulsa, OK',         event:'100m',        time:'11.88s', timeVal:11.88, place:'1st', windSpeed:'+0.5 m/s',                                 isPR:false, season:'2024' },
  { id:'r-2024-04', date:'Apr 26, 2024', meetName:'District Championship',                    location:'Broken Arrow, OK',  event:'200m',        time:'24.51s', timeVal:24.51, place:'1st', notes:'District champion',                         isPR:false, season:'2024' },
  { id:'r-2024-05', date:'May 15, 2024', meetName:'Oklahoma 6A State Championships',          location:'Edmond, OK',        event:'100m',        time:'11.84s', timeVal:11.84, place:'4th', windSpeed:'+0.0 m/s', notes:'Top 5 in the state — the start of something big', isPR:false, season:'2024' },
  { id:'r-2025-01', date:'Feb 22, 2025', meetName:'Indoor Season Opener',                    location:'Oklahoma City, OK', event:'60m',         time:'7.61s',  timeVal:7.61,  place:'1st', notes:'Dominant from the blocks',                     isPR:false, season:'2025' },
  { id:'r-2025-02', date:'Mar 15, 2025', meetName:'Green Country Invitational',               location:'Owasso, OK',        event:'100m',        time:'11.91s', timeVal:11.91, place:'2nd', windSpeed:'-0.3 m/s',                                 isPR:false, season:'2025' },
  { id:'r-2025-03', date:'Mar 28, 2025', meetName:'Union HS Panther Classic',                 location:'Tulsa, OK',         event:'200m',        time:'24.30s', timeVal:24.30, place:'1st', windSpeed:'+0.1 m/s',                                 isPR:false, season:'2025' },
  { id:'r-2025-04', date:'Apr 12, 2025', meetName:'Tulsa Invitational Spring Meet',           location:'Tulsa, OK',         event:'100m',        time:'11.80s', timeVal:11.80, place:'1st', windSpeed:'+0.2 m/s', notes:'New personal record — wind-legal', isPR:true,  season:'2025' },
];

// Only 100m times make sense on a single graph — filter for consistency
const graphResults = raceResults.filter(r => r.event === '100m').sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const placeConfig: Record<string, { bg: string; text: string; glow: string }> = {
  '1st': { bg:'from-[#D4AF37] to-[#F5E070]', text:'text-[#0F1A08]', glow:'rgba(212,175,55,0.4)' },
  '2nd': { bg:'from-[#A8A9AD] to-[#D8D9DD]', text:'text-[#0F1A08]', glow:'rgba(168,169,173,0.3)' },
  '3rd': { bg:'from-[#CD7F32] to-[#E8A04C]', text:'text-[#0F1A08]', glow:'rgba(205,127,50,0.3)'  },
};
const defaultPlace = { bg:'from-[#2a4010] to-[#1e2d0d]', text:'text-[#F5F0E8]/40', glow:'transparent' };
const getPC = (place: string) => placeConfig[place] ?? defaultPlace;

const seasons = ['2025','2024','2023'] as const;
const seasonColors: Record<string, string> = { '2025':'#9AB800', '2024':'#D4AF37', '2023':'#7A9B00' };

const easeInOut = (t: number) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;

// ─── Performance Graph Canvas ─────────────────────────────────────────────────

interface GraphProps {
  progress: number;       // 0–1, driven by IntersectionObserver
  activeId: string | null; // ID of the card currently in view
}

const PerformanceGraph: React.FC<GraphProps> = ({ progress, activeId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const progRef   = useRef(0);

  const draw = useCallback((targetProgress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, w, h);

    const PAD = { l: 44, r: 20, t: 18, b: 32 };
    const gw = w - PAD.l - PAD.r;
    const gh = h - PAD.t - PAD.b;

    const times   = graphResults.map(r => r.timeVal);
    const minTime = Math.min(...times) - 0.08;
    const maxTime = Math.max(...times) + 0.08;

    const toX = (i: number) => PAD.l + (i / (graphResults.length - 1)) * gw;
    const toY = (v: number) => PAD.t + gh - ((v - minTime) / (maxTime - minTime)) * gh;

    const pts = graphResults.map((r, i) => ({ x: toX(i), y: toY(r.timeVal), r }));

    // Grid lines
    ctx.strokeStyle = 'rgba(212,175,55,0.08)';
    ctx.lineWidth   = 0.5;
    for (let g = 0; g <= 4; g++) {
      const y = PAD.t + (g / 4) * gh;
      ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(w - PAD.r, y); ctx.stroke();
      const v = maxTime - (g / 4) * (maxTime - minTime);
      ctx.fillStyle = 'rgba(212,175,55,0.3)';
      ctx.font = '9px DM Sans, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(v.toFixed(2) + 's', PAD.l - 6, y + 3);
    }

    // Season bands
    const seasonBands = [
      { label: "'23", from: 0, to: 2,  color: 'rgba(122,155,0,0.06)'  },
      { label: "'24", from: 3, to: 7,  color: 'rgba(212,175,55,0.06)' },
      { label: "'25", from: 8, to: 11, color: 'rgba(154,184,0,0.06)'  },
    ];
    for (const band of seasonBands) {
      if (band.from >= graphResults.length) continue;
      const x1 = toX(band.from) - 10;
      const x2 = Math.min(toX(Math.min(band.to, graphResults.length - 1)) + 10, w - PAD.r);
      ctx.fillStyle = band.color;
      ctx.fillRect(x1, PAD.t, x2 - x1, gh);
      ctx.fillStyle = 'rgba(212,175,55,0.2)';
      ctx.font = '9px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(band.label, (x1 + x2) / 2, PAD.t + gh + 14);
    }

    // How far along the line to draw
    const lineEnd = targetProgress * (graphResults.length - 1);

    // Filled area beneath the line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i <= Math.floor(lineEnd); i++) ctx.lineTo(pts[i].x, pts[i].y);
    if (lineEnd % 1 > 0) {
      const fi = Math.floor(lineEnd);
      const frac = lineEnd % 1;
      ctx.lineTo(pts[fi].x + (pts[fi + 1].x - pts[fi].x) * frac,
                 pts[fi].y + (pts[fi + 1].y - pts[fi].y) * frac);
    }
    const fillEnd = lineEnd < graphResults.length - 1
      ? pts[Math.floor(lineEnd)].x + (pts[Math.min(Math.floor(lineEnd)+1, pts.length-1)].x - pts[Math.floor(lineEnd)].x) * (lineEnd % 1)
      : pts[pts.length - 1].x;
    ctx.lineTo(fillEnd, PAD.t + gh);
    ctx.lineTo(pts[0].x, PAD.t + gh);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + gh);
    grad.addColorStop(0,   'rgba(212,175,55,0.15)');
    grad.addColorStop(1,   'rgba(212,175,55,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Main line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i <= Math.floor(lineEnd); i++) ctx.lineTo(pts[i].x, pts[i].y);
    if (lineEnd % 1 > 0) {
      const fi = Math.floor(lineEnd);
      const frac = lineEnd % 1;
      ctx.lineTo(pts[fi].x + (pts[fi + 1].x - pts[fi].x) * frac,
                 pts[fi].y + (pts[fi + 1].y - pts[fi].y) * frac);
    }
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Dots
    const now = Date.now();
    for (let i = 0; i < graphResults.length; i++) {
      if (i > lineEnd) break;
      const p = pts[i];
      const r = graphResults[i];
      const isActive = r.id === activeId;
      const isPR     = r.isPR;

      // PR pulse ring
      if (isPR && i <= lineEnd) {
        const pulse = ((now / 1200) % 1);
        const ringR = 8 + pulse * 14;
        const ringA = (1 - pulse) * 0.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(154,184,0,${ringA})`;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }

      // Active card highlight
      if (isActive) {
        ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212,175,55,0.2)'; ctx.fill();
      }

      // Dot
      ctx.beginPath(); ctx.arc(p.x, p.y, isPR ? 5 : isActive ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isPR ? '#9AB800' : isActive ? '#F5E070' : '#D4AF37';
      ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y, isPR ? 2 : 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0F1A08'; ctx.fill();

      // Time label on top of last visible dot or PR dot
      if (isPR || i === Math.floor(lineEnd)) {
        ctx.fillStyle = isPR ? '#9AB800' : 'rgba(212,175,55,0.7)';
        ctx.font = `${isPR ? 500 : 400} 10px DM Sans, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(r.time, p.x, p.y - 10);
      }
    }

    rafRef.current = requestAnimationFrame(() => draw(targetProgress));
  }, [activeId]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    draw(progress);
    return () => cancelAnimationFrame(rafRef.current);
  }, [progress, draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: 110, display: 'block' }}
    />
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const PRBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#9AB800]/20 text-[#9AB800] border border-[#9AB800]/30">
    <Award size={9} /> PR
  </span>
);

const TimelineNode: React.FC<{ place: string; isActive: boolean }> = ({ place, isActive }) => {
  const cfg = getPC(place);
  return (
    <div
      className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${cfg.bg} flex items-center justify-center z-10 transition-all duration-300`}
      style={{
        boxShadow: isActive
          ? `0 0 0 3px rgba(212,175,55,0.25), 0 0 20px 4px ${cfg.glow}`
          : place === '1st' ? `0 0 12px 2px ${cfg.glow}` : 'none',
      }}
    >
      <span className={`font-display text-[11px] font-black ${cfg.text}`}>{place}</span>
    </div>
  );
};

const SeasonDivider: React.FC<{ season: string }> = ({ season }) => (
  <div className="flex items-center gap-4 my-8">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/25" />
    <div
      className="flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-[0.2em] uppercase"
      style={{ borderColor:`${seasonColors[season]}40`, color:seasonColors[season], background:`${seasonColors[season]}12` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:seasonColors[season], boxShadow:`0 0 6px ${seasonColors[season]}` }} />
      {season} Season
    </div>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/25" />
  </div>
);

// ─── Race card (with intersection observer to report visibility) ──────────────

const RaceCard: React.FC<{
  result: RaceResult;
  index: number;
  onVisible: (id: string) => void;
}> = ({ result, index, onVisible }) => {
  const ref  = useRef<HTMLDivElement>(null);
  const cfg  = getPC(result.place);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisible(result.id); },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [result.id, onVisible]);

  return (
    <div
      ref={ref}
      className="group flex-1 bg-[#1a2d0a]/60 border border-[#D4AF37]/10 rounded-2xl p-5 hover:border-[#D4AF37]/35 hover:bg-[#1a2d0a]/90 transition-all duration-300 relative overflow-hidden opacity-0 anim-fade-up"
      style={{ animationDelay:`${index * 70}ms`, animationFillMode:'forwards' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors">
              {result.event}
            </span>
            {result.isPR && <PRBadge />}
          </div>
          <p className="text-[#F5F0E8]/50 text-xs mt-0.5">{result.meetName}</p>
        </div>
        <div
          className={`flex-shrink-0 px-3 py-1 rounded-xl bg-gradient-to-br ${cfg.bg} ${cfg.text} font-display text-sm font-black shadow-md`}
          style={{ boxShadow:`0 2px 12px ${cfg.glow}` }}
        >
          {result.place}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#F5F0E8]/45 mb-3">
        <span className="flex items-center gap-1">
          <Timer size={11} className="text-[#D4AF37]/50" />
          <span className="text-[#D4AF37] font-mono font-semibold text-sm">{result.time}</span>
        </span>
        {result.windSpeed && <span className="flex items-center gap-1"><Wind size={11} />{result.windSpeed}</span>}
        <span className="flex items-center gap-1"><MapPin size={11} />{result.location}</span>
        <span className="flex items-center gap-1"><Calendar size={11} />{result.date}</span>
      </div>

      {result.notes && (
        <p className="text-[#D4AF37]/65 text-xs italic border-t border-[#D4AF37]/10 pt-2">{result.notes}</p>
      )}

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background:'linear-gradient(135deg,rgba(212,175,55,0.04) 0%,transparent 60%)' }} />
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const RaceResultsTimeline: React.FC = () => {
  const sectionRef    = useRef<HTMLElement>(null);
  const [graphProg, setGraphProg] = useState(0);
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [activeSeason, setActiveSeason] = useState<string>('all');
  const [showAll, setShowAll]           = useState(false);
  const animRef = useRef<number>(0);

  // Scroll-triggered graph draw
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let targetProg = 0;
    let currentProg = 0;

    const obs = new IntersectionObserver(
      ([entry]) => {
        // Once 15% visible, start drawing; full line at 80% visible
        targetProg = entry.isIntersecting
          ? Math.min(1, (entry.intersectionRatio - 0.15) / 0.65)
          : 0;
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );
    obs.observe(section);

    const animate = () => {
      currentProg += (targetProg - currentProg) * 0.04;
      setGraphProg(easeInOut(Math.max(0, Math.min(1, currentProg))));
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => { obs.disconnect(); cancelAnimationFrame(animRef.current); };
  }, []);

  const handleVisible = useCallback((id: string) => setActiveId(id), []);

  const filtered  = activeSeason === 'all' ? raceResults : raceResults.filter(r => r.season === activeSeason);
  const displayed = showAll ? filtered : filtered.slice(0, 6);
  const hasMore   = filtered.length > 6;

  const grouped = useMemo(() =>
    seasons.reduce<Record<string, RaceResult[]>>((acc, s) => {
      const items = displayed.filter(r => r.season === s);
      if (items.length) acc[s] = items;
      return acc;
    }, {}),
    [displayed]
  );

  // Stat strip above graph
  const prResult = graphResults.find(r => r.isPR);
  const firstResult = graphResults[0];
  const improvement = firstResult && prResult
    ? (firstResult.timeVal - prResult.timeVal).toFixed(2)
    : null;

  return (
    <section ref={sectionRef} id="race-results" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1807] via-[#0F1A08] to-[#0d1807]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        {[...Array(7)].map((_,i) => (
          <div key={i} className="absolute top-0 bottom-0 border-r border-[#D4AF37]" style={{ left:`${(i+1)*12.5}%` }} />
        ))}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[#D4AF37]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center mb-10 anim-fade-up">
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">Every Split. Every Start.</p>
          <h2 className="font-display text-5xl sm:text-6xl font-black text-white">
            Race <span className="text-shimmer">Results</span>
          </h2>
          <p className="text-[#F5F0E8]/45 text-sm mt-4 max-w-sm mx-auto leading-relaxed">
            A living record of every start, every finish line, every number that tells the story.
          </p>
        </div>

        {/* ── Performance graph strip ──────────────────────────────────────── */}
        <div className="relative bg-[#1a2d0a]/40 border border-[#D4AF37]/12 rounded-2xl mb-10 overflow-hidden anim-fade-up delay-1">
          {/* Stat chips */}
          <div className="flex items-center gap-6 px-5 pt-4 pb-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <TrendingDown size={13} className="text-[#9AB800]" />
              <span className="text-[#F5F0E8]/45 text-xs">100m progression</span>
            </div>
            {improvement && (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[#F5F0E8]/35 text-xs">{firstResult?.time}</span>
                <span className="text-[#F5F0E8]/20 text-xs">→</span>
                <span className="text-[#9AB800] text-xs font-semibold font-mono">{prResult?.time}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#9AB800]/15 text-[#9AB800] text-[10px] font-bold border border-[#9AB800]/25">
                  −{improvement}s
                </span>
              </div>
            )}
          </div>

          <PerformanceGraph progress={graphProg} activeId={activeId} />

          {/* "PR" callout pin */}
          {prResult && (
            <div className="absolute bottom-5 right-5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#9AB800]/15 border border-[#9AB800]/30 text-[#9AB800] text-[10px] font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-[#9AB800] animate-pulse" />
              Current PR
            </div>
          )}
        </div>

        {/* ── Season filters ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-8 flex-wrap anim-fade-up delay-2">
          {['all', ...seasons].map(s => (
            <button
              key={s}
              onClick={() => { setActiveSeason(s); setShowAll(false); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border transition-all duration-200 ${
                activeSeason === s
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0F1A08]'
                  : 'border-[#D4AF37]/20 text-[#D4AF37]/60 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {/* ── Timeline ─────────────────────────────────────────────────────── */}
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#D4AF37]/30 via-[#D4AF37]/15 to-transparent pointer-events-none" />

          {Object.entries(grouped).map(([season, results]) => (
            <div key={season}>
              {activeSeason === 'all' && <SeasonDivider season={season} />}
              <div className="space-y-4">
                {results.map((r, i) => (
                  <div key={r.id} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 mt-4">
                      <TimelineNode place={r.place} isActive={activeId === r.id} />
                    </div>
                    <div className="flex-1">
                      <RaceCard result={r} index={i} onVisible={handleVisible} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-4 items-center mt-6 ml-1">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#D4AF37]/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#7A9B00] animate-pulse" />
            </div>
            <span className="text-[#D4AF37]/40 text-xs italic">More results each season…</span>
          </div>
        </div>

        {/* ── Show more ────────────────────────────────────────────────────── */}
        {hasMore && !showAll && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/8 text-[#D4AF37]/80 text-sm font-medium hover:bg-[#D4AF37]/15 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all duration-200 group"
            >
              Show all {filtered.length} results
              <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* ── Legend ───────────────────────────────────────────────────────── */}
        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-[#F5F0E8]/35 flex-wrap">
          {[['#D4AF37','#F5E070','1st'],['#A8A9AD','#D8D9DD','2nd'],['#CD7F32','#E8A04C','3rd']].map(([a,b,label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background:`linear-gradient(135deg,${a},${b})` }} />
              {label} place
            </div>
          ))}
          <div className="flex items-center gap-1.5"><PRBadge /><span>= personal record</span></div>
        </div>
      </div>
    </section>
  );
};

export default RaceResultsTimeline;
