/**
 * Meet HaSammie Suah — Digital Postcards
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 *
 * What this is:
 *  Supporters choose one of 4 illustrated postcard designs, write a note,
 *  and the postcard is rendered on a canvas — styled, personal, and
 *  screenshot-ready. Sammie receives a copy via the existing contact email
 *  mutation. The rendered card is also downloadable as a PNG.
 *
 *  4 postcard designs:
 *   1. Race Day      — dark forest bg, gold track lanes, speed lines
 *   2. Champion      — trophy podium, warm gold gradient
 *   3. Oklahoma      — state outline silhouette, sunset colours
 *   4. Freshman Rise — clean minimal, progression line graph motif
 *
 * Drop into: src/components/PostcardSection.tsx
 *
 * Integration — HomePage.tsx:
 *   import { PostcardSection } from './components/PostcardSection';
 *   Add <PostcardSection /> after <SupporterWall />
 *
 * Integration — Navbar.tsx (optional):
 *   { label: 'Postcards', href: '#postcards' }
 *
 * No new backend model needed — postcards are sent via the existing
 * sendContactEmail mutation and optionally stored as SupporterMessages.
 * A future iteration can add a PostcardRecord model to let Sammie browse
 * received postcards in the admin.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Send, Download, CheckCircle, AlertCircle, Loader,
  ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react';
import { GiTrophyCup, GiRose } from 'react-icons/gi';
import { FaHeart } from 'react-icons/fa';

// ─── GraphQL — reuses existing mutation ──────────────────────────────────────

const SEND_POSTCARD = gql`
  mutation SendContactEmail($input: ContactFormInput!) {
    sendContactEmail(input: $input)
  }
`;

// ─── Postcard designs ─────────────────────────────────────────────────────────

interface PostcardDesign {
  id:       string;
  name:     string;
  tagline:  string;
  draw:     (ctx: CanvasRenderingContext2D, w: number, h: number, message: string, from: string) => void;
}

/** Shared draw helpers */
function drawTrackLanes(ctx: CanvasRenderingContext2D, w: number, h: number, alpha = 0.08) {
  ctx.save();
  ctx.strokeStyle = `rgba(212,175,55,${alpha})`;
  ctx.lineWidth   = 1;
  for (let i = 1; i <= 7; i++) {
    ctx.beginPath();
    ctx.moveTo((i / 8) * w, 0);
    ctx.lineTo((i / 8) * w, h);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPostcardText(
  ctx: CanvasRenderingContext2D,
  message: string,
  from:    string,
  x: number, y: number, w: number,
  msgColor = 'rgba(245,240,232,0.85)',
  fromColor = 'rgba(212,175,55,0.8)',
) {
  // Message body — word wrap
  ctx.save();
  ctx.fillStyle = msgColor;
  ctx.font      = '400 15px DM Sans, sans-serif';
  const words   = message.split(' ');
  let line      = '';
  let ly        = y;
  const maxW    = w - 40;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, ly);
      line = word;
      ly  += 22;
    } else {
      line = test;
    }
  }
  if (line) { ctx.fillText(line, x, ly); ly += 22; }

  // From line
  ly += 8;
  ctx.fillStyle = fromColor;
  ctx.font      = '500 13px DM Sans, sans-serif';
  ctx.fillText(`— ${from || 'A supporter'}`, x, ly);
  ctx.restore();
}

function drawSammieBranding(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  color = '#D4AF37',
) {
  ctx.save();
  ctx.fillStyle   = color;
  ctx.font        = '700 11px DM Sans, sans-serif';
  ctx.textAlign   = 'right';
  ctx.globalAlpha = 0.4;
  ctx.fillText('meethasammiesuah.com', w - 16, h - 12);
  ctx.restore();
}

const DESIGNS: PostcardDesign[] = [

  // ── 1. Race Day ──────────────────────────────────────────────────────────────
  {
    id: 'race-day', name: 'Race Day', tagline: 'Gold lanes, dark forest',
    draw(ctx, w, h, message, from) {
      // Background
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#0a1405');
      bg.addColorStop(1, '#1a3008');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      drawTrackLanes(ctx, w, h, 0.12);

      // Speed lines
      ctx.save();
      ctx.strokeStyle = 'rgba(212,175,55,0.06)';
      ctx.lineWidth   = 2;
      for (let i = 0; i < 6; i++) {
        const y = 60 + i * 28;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w * 0.6, y + 8);
        ctx.stroke();
      }
      ctx.restore();

      // Gold accent bar top
      const bar = ctx.createLinearGradient(0, 0, w, 0);
      bar.addColorStop(0, 'rgba(212,175,55,0)');
      bar.addColorStop(0.5, 'rgba(212,175,55,0.7)');
      bar.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = bar;
      ctx.fillRect(0, 0, w, 3);

      // Headline
      ctx.save();
      ctx.fillStyle = '#D4AF37';
      ctx.font      = '900 28px Playfair Display, serif';
      ctx.textAlign = 'left';
      ctx.fillText('Run, Sammie.', 24, 52);
      ctx.fillStyle = 'rgba(212,175,55,0.45)';
      ctx.font      = '400 12px DM Sans, sans-serif';
      ctx.fillText('Union High School · Tulsa, Oklahoma', 24, 72);
      ctx.restore();

      // Divider
      ctx.save();
      ctx.strokeStyle = 'rgba(212,175,55,0.2)';
      ctx.lineWidth   = 0.5;
      ctx.beginPath();
      ctx.moveTo(24, 90);
      ctx.lineTo(w - 24, 90);
      ctx.stroke();
      ctx.restore();

      drawPostcardText(ctx, message, from, 24, 116, w);
      drawSammieBranding(ctx, w, h);
    },
  },

  // ── 2. Champion ──────────────────────────────────────────────────────────────
  {
    id: 'champion', name: 'Champion', tagline: 'Trophy gold, warm glow',
    draw(ctx, w, h, message, from) {
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#1a1200');
      bg.addColorStop(0.6, '#2d1e00');
      bg.addColorStop(1, '#1a0e00');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Radial glow centre
      const glow = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.5);
      glow.addColorStop(0, 'rgba(212,175,55,0.12)');
      glow.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Top accent
      const bar = ctx.createLinearGradient(0, 0, w, 0);
      bar.addColorStop(0, 'rgba(212,175,55,0)');
      bar.addColorStop(0.5, 'rgba(212,175,55,0.8)');
      bar.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = bar;
      ctx.fillRect(0, 0, w, 3);

      // Trophy silhouette (simple geometric)
      ctx.save();
      ctx.fillStyle   = 'rgba(212,175,55,0.08)';
      ctx.strokeStyle = 'rgba(212,175,55,0.15)';
      ctx.lineWidth   = 1.5;
      const tx = w - 90, ty = 10;
      // Cup
      ctx.beginPath();
      ctx.arc(tx + 30, ty + 30, 24, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // Stem
      ctx.fillRect(tx + 24, ty + 54, 12, 20);
      ctx.strokeRect(tx + 24, ty + 54, 12, 20);
      // Base
      ctx.fillRect(tx + 14, ty + 72, 32, 6);
      ctx.strokeRect(tx + 14, ty + 72, 32, 6);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#F5E070';
      ctx.font      = '900 26px Playfair Display, serif';
      ctx.textAlign = 'left';
      ctx.fillText('Top 5 in Oklahoma.', 24, 50);
      ctx.fillStyle = 'rgba(212,175,55,0.5)';
      ctx.font      = '400 11px DM Sans, sans-serif';
      ctx.fillText('And she\'s only in 11th grade.', 24, 68);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(212,175,55,0.2)';
      ctx.lineWidth   = 0.5;
      ctx.beginPath(); ctx.moveTo(24, 86); ctx.lineTo(w - 24, 86); ctx.stroke();
      ctx.restore();

      drawPostcardText(ctx, message, from, 24, 112, w, 'rgba(245,240,232,0.8)', 'rgba(212,175,55,0.75)');
      drawSammieBranding(ctx, w, h, '#D4AF37');
    },
  },

  // ── 3. Oklahoma ──────────────────────────────────────────────────────────────
  {
    id: 'oklahoma', name: 'Oklahoma', tagline: 'Sunset horizon, home pride',
    draw(ctx, w, h, message, from) {
      // Sunset gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0,   '#1a0a00');
      bg.addColorStop(0.4, '#3d1500');
      bg.addColorStop(0.7, '#1a2d0a');
      bg.addColorStop(1,   '#0F1A08');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Horizon glow
      const hor = ctx.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, w * 0.7);
      hor.addColorStop(0, 'rgba(212,100,0,0.18)');
      hor.addColorStop(1, 'rgba(212,100,0,0)');
      ctx.fillStyle = hor;
      ctx.fillRect(0, 0, w, h);

      // Horizon line
      ctx.save();
      ctx.strokeStyle = 'rgba(212,120,0,0.35)';
      ctx.lineWidth   = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.55);
      ctx.lineTo(w, h * 0.55);
      ctx.stroke();
      ctx.restore();

      // Top accent
      const bar = ctx.createLinearGradient(0, 0, w, 0);
      bar.addColorStop(0, 'rgba(212,120,0,0)');
      bar.addColorStop(0.5, 'rgba(212,120,0,0.6)');
      bar.addColorStop(1, 'rgba(212,120,0,0)');
      ctx.fillStyle = bar;
      ctx.fillRect(0, 0, w, 3);

      ctx.save();
      ctx.fillStyle = '#F5A050';
      ctx.font      = '900 26px Playfair Display, serif';
      ctx.textAlign = 'left';
      ctx.fillText('Tulsa\'s Own.', 24, 50);
      ctx.fillStyle = 'rgba(245,160,80,0.5)';
      ctx.font      = '400 11px DM Sans, sans-serif';
      ctx.fillText('Oklahoma is watching. Oklahoma is proud.', 24, 68);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(212,120,0,0.25)';
      ctx.lineWidth   = 0.5;
      ctx.beginPath(); ctx.moveTo(24, 84); ctx.lineTo(w - 24, 84); ctx.stroke();
      ctx.restore();

      drawPostcardText(ctx, message, from, 24, 110, w,
        'rgba(245,240,232,0.78)', 'rgba(245,160,80,0.75)');
      drawSammieBranding(ctx, w, h, '#F5A050');
    },
  },

  // ── 4. Freshman Rise ─────────────────────────────────────────────────────────
  {
    id: 'rise', name: 'Freshman Rise', tagline: 'Minimal, the progression line',
    draw(ctx, w, h, message, from) {
      // Clean dark
      ctx.fillStyle = '#0F1A08';
      ctx.fillRect(0, 0, w, h);

      // Subtle grid
      ctx.save();
      ctx.strokeStyle = 'rgba(212,175,55,0.05)';
      ctx.lineWidth   = 0.5;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.restore();

      // Progression line (decorative — mirrors the stats chart)
      const pts = [
        { x: w * 0.05, y: h * 0.38 },
        { x: w * 0.18, y: h * 0.34 },
        { x: w * 0.32, y: h * 0.31 },
        { x: w * 0.48, y: h * 0.27 },
        { x: w * 0.62, y: h * 0.25 },
        { x: w * 0.78, y: h * 0.22 },
        { x: w * 0.92, y: h * 0.20 },
      ];

      // Fill under line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, h * 0.5);
      ctx.lineTo(pts[0].x, h * 0.5);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.5);
      grad.addColorStop(0, 'rgba(154,184,0,0.18)');
      grad.addColorStop(1, 'rgba(154,184,0,0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = '#9AB800';
      ctx.lineWidth   = 2;
      ctx.lineJoin    = 'round';
      ctx.stroke();

      // PR dot
      const last = pts[pts.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#9AB800';
      ctx.fill();
      ctx.fillStyle   = '#9AB800';
      ctx.font        = '500 9px DM Sans, sans-serif';
      ctx.textAlign   = 'center';
      ctx.fillText('11.80s PR', last.x, last.y - 10);
      ctx.restore();

      // Text area below the line
      ctx.save();
      ctx.strokeStyle = 'rgba(154,184,0,0.2)';
      ctx.lineWidth   = 0.5;
      ctx.beginPath(); ctx.moveTo(24, h * 0.55); ctx.lineTo(w - 24, h * 0.55); ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#9AB800';
      ctx.font      = '900 22px Playfair Display, serif';
      ctx.textAlign = 'left';
      ctx.fillText('12.35 → 11.80.', 24, h * 0.55 + 26);
      ctx.fillStyle = 'rgba(154,184,0,0.5)';
      ctx.font      = '400 11px DM Sans, sans-serif';
      ctx.fillText('The line keeps dropping.', 24, h * 0.55 + 44);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(154,184,0,0.15)';
      ctx.lineWidth   = 0.5;
      ctx.beginPath(); ctx.moveTo(24, h * 0.55 + 56); ctx.lineTo(w - 24, h * 0.55 + 56); ctx.stroke();
      ctx.restore();

      drawPostcardText(ctx, message, from, 24, h * 0.55 + 80, w,
        'rgba(245,240,232,0.75)', 'rgba(154,184,0,0.75)');
      drawSammieBranding(ctx, w, h, '#9AB800');
    },
  },
];

// ─── Form types ───────────────────────────────────────────────────────────────

interface CardForm {
  designId: string;
  from:     string;
  email:    string;
  message:  string;
}

const emptyForm: CardForm = {
  designId: 'race-day',
  from:     '',
  email:    '',
  message:  '',
};

// ─── Postcard canvas ──────────────────────────────────────────────────────────

const PostcardCanvas: React.FC<{
  design:  PostcardDesign;
  message: string;
  from:    string;
  ref:     React.RefObject<HTMLCanvasElement>;
}> = React.forwardRef(({ design, message, from }, ref) => {
  const canvasRef = ref as React.RefObject<HTMLCanvasElement>;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    design.draw(ctx, canvas.width, canvas.height, message || 'Write your message…', from || 'A supporter');
  }, [design, message, from, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={320}
      className="w-full rounded-2xl border border-[#D4AF37]/15"
      style={{ display: 'block' }}
    />
  );
});
PostcardCanvas.displayName = 'PostcardCanvas';

// ─── Design selector thumbnail ────────────────────────────────────────────────

const DesignThumb: React.FC<{
  design:   PostcardDesign;
  selected: boolean;
  onClick:  () => void;
}> = ({ design, selected, onClick }) => {
  const thumbRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = thumbRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    design.draw(ctx, canvas.width, canvas.height, '', '');
  }, [design]);

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col gap-2 group"
    >
      <canvas
        ref={thumbRef}
        width={140}
        height={80}
        className="w-full rounded-xl border transition-all duration-200"
        style={{
          borderColor: selected ? '#D4AF37' : 'rgba(212,175,55,0.12)',
          boxShadow:   selected ? '0 0 0 2px rgba(212,175,55,0.35)' : 'none',
        }}
      />
      <span className={`text-xs font-medium transition-colors ${selected ? 'text-[#D4AF37]' : 'text-[#F5F0E8]/40 group-hover:text-[#F5F0E8]/65'}`}>
        {design.name}
      </span>
    </button>
  );
};

// ─── Main section ─────────────────────────────────────────────────────────────

export const PostcardSection: React.FC = () => {
  const [form, setForm]         = useState<CardForm>(emptyForm);
  const [touched, setTouched]   = useState<Partial<Record<keyof CardForm, boolean>>>({});
  const [sent, setSent]         = useState(false);
  const [sendError, setSendError] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sendPostcard, { loading }] = useMutation(SEND_POSTCARD);

  const set   = (k: keyof CardForm, v: string) => setForm(f => ({ ...f, [k]: v }));
  const touch = (k: keyof CardForm) => setTouched(t => ({ ...t, [k]: true }));

  const currentDesign = DESIGNS.find(d => d.id === form.designId) ?? DESIGNS[0];

  const errors = {
    from:    !form.from.trim()               ? 'Your name is required' : '',
    email:   !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Valid email required' : '',
    message: form.message.trim().length < 10 ? 'Please write at least 10 characters' : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ from: true, email: true, message: true });
    if (hasErrors) return;
    setSendError(false);
    try {
      await sendPostcard({
        variables: {
          input: {
            name:    form.from,
            email:   form.email,
            subject: `Digital Postcard — "${currentDesign.name}" design`,
            message: `Postcard design: ${currentDesign.name}\n\n${form.message}\n\n— ${form.from}`,
          },
        },
      });
      setSent(true);
    } catch {
      setSendError(true);
    }
  };

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link    = document.createElement('a');
    link.download = `sammie-postcard-${currentDesign.id}.png`;
    link.href     = canvas.toDataURL('image/png');
    link.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  }, [currentDesign.id]);

  const nextDesign = () => {
    const idx = DESIGNS.findIndex(d => d.id === form.designId);
    set('designId', DESIGNS[(idx + 1) % DESIGNS.length].id);
  };
  const prevDesign = () => {
    const idx = DESIGNS.findIndex(d => d.id === form.designId);
    set('designId', DESIGNS[(idx - 1 + DESIGNS.length) % DESIGNS.length].id);
  };

  const inputCls = "w-full bg-[#0a1005] border border-[#D4AF37]/18 rounded-xl px-4 py-2.5 text-[#F5F0E8] text-sm placeholder-[#F5F0E8]/18 focus:outline-none focus:border-[#D4AF37]/50 transition-colors";
  const labelCls = "block text-[#D4AF37]/55 text-xs font-semibold uppercase tracking-wider mb-1.5";

  return (
    <section id="postcards" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1005] via-[#0F1A08] to-[#0a1005]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 border-r border-[#D4AF37]"
            style={{ left: `${(i + 1) * 12.5}%` }} />
        ))}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-64 bg-[#D4AF37]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center mb-14 anim-fade-up">
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">
            For Sammie, with love
          </p>
          <h2 className="font-display text-5xl sm:text-6xl font-black text-white mb-4">
            Send a <span className="text-shimmer">Postcard</span>
          </h2>
          <p className="text-[#F5F0E8]/45 text-sm max-w-md mx-auto leading-relaxed">
            Choose a design, write your note, and send Sammie a keepsake she can keep.
            Download your card or send it directly — it goes straight to her inbox.
          </p>
        </div>

        {sent ? (
          /* ── Success state ───────────────────────────────────────────────── */
          <div className="flex flex-col items-center gap-6 py-16 text-center anim-fade-up">
            <div className="w-16 h-16 rounded-full bg-[#9AB800]/15 border border-[#9AB800]/30 flex items-center justify-center">
              <CheckCircle size={28} className="text-[#9AB800]" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Postcard sent to Sammie!</h3>
              <p className="text-[#F5F0E8]/45 text-sm max-w-xs mx-auto leading-relaxed">
                Your "{currentDesign.name}" postcard is on its way. You can also download it to keep.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/8 text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37]/15 transition-all"
              >
                <Download size={14} /> Download your card
              </button>
              <button
                onClick={() => { setSent(false); setForm(emptyForm); setTouched({}); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#F5F0E8]/10 text-[#F5F0E8]/45 text-sm hover:text-[#F5F0E8]/70 transition-all"
              >
                <RefreshCw size={14} /> Send another
              </button>
            </div>
            {/* Show the finished card */}
            <div className="w-full max-w-lg mt-4">
              <PostcardCanvas
                ref={canvasRef}
                design={currentDesign}
                message={form.message}
                from={form.from}
              />
            </div>
          </div>
        ) : (
          /* ── Builder ─────────────────────────────────────────────────────── */
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Left: preview + design picker */}
            <div className="lg:col-span-3 flex flex-col gap-6">

              {/* Live preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[#D4AF37]/55 text-xs font-semibold uppercase tracking-wider">Preview</p>
                  <div className="flex items-center gap-1">
                    <button onClick={prevDesign} className="w-7 h-7 rounded-lg bg-[#1a2d0a]/60 border border-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors">
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-[#F5F0E8]/35 text-xs px-2">
                      {DESIGNS.findIndex(d => d.id === form.designId) + 1} / {DESIGNS.length}
                    </span>
                    <button onClick={nextDesign} className="w-7 h-7 rounded-lg bg-[#1a2d0a]/60 border border-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
                <PostcardCanvas
                  ref={canvasRef}
                  design={currentDesign}
                  message={form.message}
                  from={form.from}
                />
              </div>

              {/* Design thumbnails */}
              <div>
                <p className="text-[#D4AF37]/55 text-xs font-semibold uppercase tracking-wider mb-3">Choose a design</p>
                <div className="grid grid-cols-4 gap-3">
                  {DESIGNS.map(d => (
                    <DesignThumb
                      key={d.id}
                      design={d}
                      selected={form.designId === d.id}
                      onClick={() => set('designId', d.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Download button */}
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/6 text-[#D4AF37]/70 text-sm font-medium hover:bg-[#D4AF37]/14 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all"
              >
                {downloaded ? <CheckCircle size={14} className="text-[#9AB800]" /> : <Download size={14} />}
                {downloaded ? 'Downloaded!' : 'Download as PNG'}
              </button>
            </div>

            {/* Right: form */}
            <div className="lg:col-span-2">
              <div className="bg-[#1a2d0a]/50 border border-[#D4AF37]/15 rounded-3xl p-6 sticky top-28">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/12 flex items-center justify-center flex-shrink-0">
                    <GiRose size={18} className="text-[#E1306C]/80" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-white">Write your note</h3>
                    <p className="text-[#F5F0E8]/38 text-xs mt-0.5">It goes straight to Sammie's inbox</p>
                  </div>
                </div>

                <form onSubmit={handleSend} className="space-y-4">
                  {/* From name */}
                  <div>
                    <label className={labelCls}>Your name *</label>
                    <input className={inputCls} value={form.from}
                      onChange={e => set('from', e.target.value)}
                      onBlur={() => touch('from')}
                      placeholder="Coach Smith" />
                    {touched.from && errors.from && (
                      <p className="text-red-400/75 text-xs mt-1">{errors.from}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelCls}>Your email *</label>
                    <input className={inputCls} type="email" value={form.email}
                      onChange={e => set('email', e.target.value)}
                      onBlur={() => touch('email')}
                      placeholder="you@example.com" />
                    {touched.email && errors.email && (
                      <p className="text-red-400/75 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className={labelCls}>Your message *</label>
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={5}
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      onBlur={() => touch('message')}
                      placeholder="Write something Sammie will remember…"
                    />
                    {touched.message && errors.message && (
                      <p className="text-red-400/75 text-xs mt-1">{errors.message}</p>
                    )}
                    <p className="text-[#F5F0E8]/22 text-xs mt-1 text-right">
                      {form.message.length} characters
                    </p>
                  </div>

                  {sendError && (
                    <div className="flex items-center gap-2 text-red-400/75 text-sm">
                      <AlertCircle size={13} /> Something went wrong — please try again.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#D4AF37] text-[#0F1A08] font-bold text-sm hover:bg-[#F5E070] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
                    {loading ? 'Sending…' : 'Send postcard to Sammie'}
                  </button>

                  <p className="text-[#F5F0E8]/22 text-xs text-center">
                    Your postcard goes directly to Sammie's inbox.
                    Download it too — it's yours to keep.
                  </p>
                </form>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default PostcardSection;
