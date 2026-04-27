/**
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 * Meet HaSammie Suah — Live Meet Countdown
 *
 * Two exports:
 *
 *  1. <MeetCountdownBanner />
 *     A slim fixed banner that slides down from the top of the page
 *     once the next upcoming meet is within 30 days.
 *     Add it once, directly inside <HomePage /> just after <Navbar />.
 *
 *  2. <MeetCountdownHero />
 *     A larger inline block designed to sit inside <HeroSection />
 *     just above the CTA buttons — shows the full countdown clock
 *     with days / hours / minutes / seconds ticking live.
 *     Optional: only render it when a meet is ≤ 60 days away.
 *
 * Both components:
 *  - Read from useSite() — no extra queries needed
 *  - Auto-select the next upcoming event (soonest future date)
 *  - Dismiss-able (banner only) — preference stored in sessionStorage
 *  - Zero dependencies beyond what's already in the project
 *
 * Drop into: src/components/MeetCountdown.tsx
 *
 * Integration — HomePage.tsx:
 *   import { MeetCountdownBanner } from './components/MeetCountdown';
 *   // Inside <div className="min-h-screen bg-[#0F1A08]">:
 *   <Navbar />
 *   <MeetCountdownBanner />   ← add here
 *   <HeroSection />
 *   ...
 *
 * Integration — HeroSection.tsx (optional inline clock):
 *   import { MeetCountdownHero } from './MeetCountdown';
 *   // Just above the scroll-down CTA chevron:
 *   <MeetCountdownHero />
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Trophy, Dumbbell, HelpCircle, MapPin, X, ChevronRight } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import type { UpcomingEvent } from '../context/SiteContext';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Show banner when meet is within this many days */
const BANNER_THRESHOLD_DAYS = 30;

/** Show hero clock when meet is within this many days */
const HERO_THRESHOLD_DAYS = 60;

const DISMISS_KEY = 'sammie_countdown_dismissed';

// ─── Event type config ────────────────────────────────────────────────────────

const typeConfig: Record<string, {
  icon:  React.ReactNode;
  color: string;
  label: string;
  accent: string;
}> = {
  meet:         { icon: <Flag size={11} />,         color: '#D4AF37', label: 'Meet',           accent: 'rgba(212,175,55,0.15)'  },
  championship: { icon: <Trophy size={11} />,        color: '#F5E070', label: 'Championship',  accent: 'rgba(245,224,112,0.15)' },
  training:     { icon: <Dumbbell size={11} />,      color: '#9AB800', label: 'Training',       accent: 'rgba(154,184,0,0.15)'   },
  other:        { icon: <HelpCircle size={11} />,    color: '#7A9B00', label: 'Event',          accent: 'rgba(122,155,0,0.15)'   },
};
const getType = (t: string) => typeConfig[t] ?? typeConfig.other;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNextEvent(events: UpcomingEvent[]): UpcomingEvent | null {
  const now = Date.now();
  return [...events]
    .filter(e => new Date(e.date).getTime() > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // ms
}

function calcTimeLeft(targetDate: string): TimeLeft {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return {
    total:   diff,
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ─── Shared tick hook ─────────────────────────────────────────────────────────

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    targetDate ? calcTimeLeft(targetDate) : { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  );

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => setTimeLeft(calcTimeLeft(targetDate));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

// ─── Digit flip cell (hero clock) ─────────────────────────────────────────────

const ClockCell: React.FC<{ value: string; label: string; color: string }> = ({ value, label, color }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-2xl flex items-center justify-center"
      style={{ background: 'rgba(26,45,10,0.7)', border: `1px solid ${color}25` }}
    >
      {/* Top / bottom split line */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{ top: '50%', background: `${color}20` }}
      />
      <span
        className="font-display text-3xl sm:text-4xl font-black tabular-nums"
        style={{ color, fontFeatureSettings: '"tnum"' }}
      >
        {value}
      </span>
    </div>
    <span className="text-[#F5F0E8]/35 text-[10px] font-bold tracking-[0.2em] uppercase">{label}</span>
  </div>
);

const Colon: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex flex-col gap-2 pb-6 self-end">
    {[0, 1].map(i => (
      <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: color, opacity: 0.4 }} />
    ))}
  </div>
);

// ─── 1. Banner ────────────────────────────────────────────────────────────────

export const MeetCountdownBanner: React.FC = () => {
  const { data }  = useSite();
  const next      = getNextEvent(data.events);
  const days      = next ? daysUntil(next.date) : Infinity;
  const timeLeft  = useCountdown(next?.date ?? null);
  const cfg       = next ? getType(next.type) : getType('other');

  const [visible, setVisible]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    if (!next || days > BANNER_THRESHOLD_DAYS) return;
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (dismissed === next.id) return;
    // Slight delay so it slides in after page loads
    const t = setTimeout(() => { setMounted(true); setVisible(true); }, 800);
    return () => clearTimeout(t);
  }, [next, days]);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (next) sessionStorage.setItem(DISMISS_KEY, next.id);
    setTimeout(() => setMounted(false), 400);
  }, [next]);

  if (!mounted || !next) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[55] transition-transform duration-500"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      <div
        className="relative flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6"
        style={{
          background: `linear-gradient(90deg, #0a1405 0%, #111e08 40%, #0a1405 100%)`,
          borderBottom: `1px solid ${cfg.color}30`,
        }}
      >
        {/* Left: type badge + meet name */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex-shrink-0"
            style={{ background: cfg.accent, color: cfg.color, border: `1px solid ${cfg.color}35` }}
          >
            {cfg.icon} {cfg.label}
          </div>
          <span className="text-white text-xs font-semibold truncate">{next.title}</span>
          <div className="hidden sm:flex items-center gap-1 text-[#F5F0E8]/35 text-xs flex-shrink-0">
            <MapPin size={10} />
            <span>{next.location}</span>
          </div>
        </div>

        {/* Center: live countdown */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {timeLeft.days > 0 && (
            <span className="text-[#F5F0E8]/40 text-xs hidden sm:inline">in</span>
          )}
          <div
            className="flex items-center gap-1 px-3 py-1 rounded-full font-mono text-xs font-bold tabular-nums"
            style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
          >
            {timeLeft.days > 0 ? (
              <>
                <span>{timeLeft.days}d</span>
                <span className="opacity-40">·</span>
                <span>{pad(timeLeft.hours)}h</span>
                <span className="opacity-40">·</span>
                <span>{pad(timeLeft.minutes)}m</span>
                <span className="opacity-40">·</span>
                <span>{pad(timeLeft.seconds)}s</span>
              </>
            ) : (
              <span>Today!</span>
            )}
          </div>
          <span
            className="hidden sm:flex items-center gap-1 text-xs font-medium cursor-pointer transition-all"
            style={{ color: `${cfg.color}80` }}
            onClick={() => document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })}
          >
            View events <ChevronRight size={11} />
          </span>
        </div>

        {/* Right: dismiss */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 ml-2 p-1 rounded-full text-[#F5F0E8]/25 hover:text-[#F5F0E8]/60 transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

// ─── 2. Hero clock ────────────────────────────────────────────────────────────

export const MeetCountdownHero: React.FC = () => {
  const { data } = useSite();
  const next     = getNextEvent(data.events);
  const days     = next ? daysUntil(next.date) : Infinity;
  const timeLeft = useCountdown(next?.date ?? null);
  const cfg      = next ? getType(next.type) : getType('other');

  if (!next || days > HERO_THRESHOLD_DAYS) return null;

  return (
    <div className="flex flex-col items-center gap-5 mb-10 anim-fade-up delay-3">
      {/* Label */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold tracking-[0.18em] uppercase"
        style={{ borderColor: `${cfg.color}35`, color: cfg.color, background: cfg.accent }}
      >
        {cfg.icon}
        <span>Next {cfg.label}</span>
        <span className="opacity-50">·</span>
        <span className="font-normal opacity-75">{next.title}</span>
      </div>

      {/* Clock */}
      <div className="flex items-end gap-2 sm:gap-3">
        <ClockCell value={pad(timeLeft.days)}    label="Days"    color={cfg.color} />
        <Colon color={cfg.color} />
        <ClockCell value={pad(timeLeft.hours)}   label="Hours"   color={cfg.color} />
        <Colon color={cfg.color} />
        <ClockCell value={pad(timeLeft.minutes)} label="Minutes" color={cfg.color} />
        <Colon color={cfg.color} />
        <ClockCell value={pad(timeLeft.seconds)} label="Seconds" color={cfg.color} />
      </div>

      {/* Date + location */}
      <div className="flex items-center gap-3 text-xs text-[#F5F0E8]/35">
        <span>{formatShortDate(next.date)}</span>
        <span className="opacity-40">·</span>
        <span className="flex items-center gap-1">
          <MapPin size={10} /> {next.location}
        </span>
      </div>
    </div>
  );
};

export default MeetCountdownBanner;
