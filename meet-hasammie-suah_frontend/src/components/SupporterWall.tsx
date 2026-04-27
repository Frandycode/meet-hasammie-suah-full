/**
 * Meet HaSammie Suah — Supporter Wall (v3)
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 *
 * What's new in v3:
 *  - Full gift catalog: original reactions + flowers + confetti — nothing removed
 *  - Gifts are grouped into 4 category tabs: Flowers · Sports · Reactions · Extras
 *  - Confetti is both a sendable gift AND fires as a canvas burst on every submit
 *  - Confetti burst uses the selected gift's color palette for the particle colours
 *  - Category tabs keep the picker compact even with 22 options
 *
 * Gift keys are stored as plain strings in the existing `emoji` DB column —
 * fully backward compatible. Old keys (rose, trophy, heart, etc.) still work.
 *
 * Drop into: src/components/SupporterWall.tsx (replace previous version)
 *
 * Dependencies (already in package.json):
 *   react-icons   — all gift icons
 *   lucide-react  — UI chrome icons
 *
 * No extra npm package needed for confetti — pure canvas implementation.
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Send, CheckCircle, AlertCircle, Loader,
  MapPin, ChevronDown, Pin, Flame, Zap,
  Sparkles, Music, RefreshCw,
} from 'lucide-react';
import {
  GiRose, GiSunflower, GiDaisy, GiFlowerPot, GiLotusFlower,
  GiLaurelCrown, GiTrophyCup, GiMedal, GiRunningShoe, GiMuscleUp,
  GiPrayer, GiDiamondRing, GiPartyPopper,
} from 'react-icons/gi';
import {
  FaHeart, FaFire, FaBolt, FaStar, FaHandshake,
} from 'react-icons/fa';
import { BsEmojiSunglasses, BsStars } from 'react-icons/bs';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_SUPPORTER_MESSAGES = gql`
  query GetSupporterMessages {
    supporterMessages(approvedOnly: true) {
      id name location amount message platform
      featured pinned emoji createdAt
    }
  }
`;

const SUBMIT_MESSAGE = gql`
  mutation SubmitSupporterMessage($input: SupporterMessageInput!) {
    submitSupporterMessage(input: $input) { id }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupporterMessage {
  id:        string;
  name:      string;
  location:  string | null;
  amount:    string | null;
  message:   string;
  platform:  string | null;
  featured:  boolean;
  pinned:    boolean;
  emoji:     string | null;
  createdAt: string;
}

interface MessageForm {
  name:     string;
  location: string;
  amount:   string;
  message:  string;
  platform: string;
  emoji:    string;
}

const emptyForm: MessageForm = {
  name: '', location: '', amount: '', message: '', platform: '', emoji: 'heart',
};

// ─── Gift catalog ─────────────────────────────────────────────────────────────

interface GiftItem {
  key:      string;
  label:    string;
  icon:     React.ReactNode;
  color:    string;
  category: 'flowers' | 'sports' | 'reactions' | 'extras';
}

type GiftCategory = 'all' | 'flowers' | 'sports' | 'reactions' | 'extras';

const CATEGORY_TABS: Array<{ key: GiftCategory; label: string }> = [
  { key: 'all',       label: 'All'       },
  { key: 'flowers',   label: 'Flowers'   },
  { key: 'sports',    label: 'Sports'    },
  { key: 'reactions', label: 'Reactions' },
  { key: 'extras',    label: 'Extras'    },
];

const ALL_GIFTS: GiftItem[] = [
  // Flowers
  { key: 'rose',      label: 'Rose',           icon: <GiRose size={22} />,          color: '#E1306C', category: 'flowers'   },
  { key: 'sunflower', label: 'Sunflower',      icon: <GiSunflower size={22} />,     color: '#F5C842', category: 'flowers'   },
  { key: 'tulip',     label: 'Tulip',          icon: <GiDaisy size={22} />,         color: '#CC66BB', category: 'flowers'   },
  { key: 'bouquet',   label: 'Bouquet',        icon: <GiFlowerPot size={22} />,     color: '#9AB800', category: 'flowers'   },
  { key: 'blossom',   label: 'Cherry Blossom', icon: <GiLotusFlower size={22} />,   color: '#FFB7C5', category: 'flowers'   },

  // Sports
  { key: 'trophy',    label: 'Trophy',         icon: <GiTrophyCup size={22} />,     color: '#D4AF37', category: 'sports'    },
  { key: 'medal',     label: 'Gold Medal',     icon: <GiMedal size={22} />,         color: '#D4AF37', category: 'sports'    },
  { key: 'crown',     label: 'Laurel Crown',   icon: <GiLaurelCrown size={22} />,   color: '#D4AF37', category: 'sports'    },
  { key: 'shoe',      label: 'Running Shoe',   icon: <GiRunningShoe size={22} />,   color: '#7A9B00', category: 'sports'    },
  { key: 'muscle',    label: 'Strong',         icon: <GiMuscleUp size={22} />,      color: '#9AB800', category: 'sports'    },

  // Reactions
  { key: 'heart',     label: 'Love',           icon: <FaHeart size={20} />,         color: '#E1306C', category: 'reactions' },
  { key: 'fire',      label: 'Fire',           icon: <FaFire size={20} />,          color: '#FF6B35', category: 'reactions' },
  { key: 'bolt',      label: 'Lightning',      icon: <FaBolt size={20} />,          color: '#F5C842', category: 'reactions' },
  { key: 'star',      label: 'Star',           icon: <FaStar size={20} />,          color: '#F5C842', category: 'reactions' },
  { key: 'handshake', label: 'Support',        icon: <FaHandshake size={20} />,     color: '#9AB800', category: 'reactions' },
  { key: 'pray',      label: 'Praying Hands',  icon: <GiPrayer size={22} />,        color: '#D4AF37', category: 'reactions' },
  { key: 'goat',      label: 'GOAT',           icon: <BsEmojiSunglasses size={22}/>,color: '#9AB800', category: 'reactions' },

  // Extras
  { key: 'confetti',  label: 'Confetti',       icon: <GiPartyPopper size={22} />,   color: '#FF6B35', category: 'extras'    },
  { key: 'sparkle',   label: 'Sparkles',       icon: <BsStars size={22} />,         color: '#9AB800', category: 'extras'    },
  { key: 'flame',     label: 'Cheer',          icon: <Flame size={22} />,           color: '#FF6B35', category: 'extras'    },
  { key: 'zap',       label: 'Energy',         icon: <Zap size={22} />,             color: '#F5C842', category: 'extras'    },
  { key: 'music',     label: 'Vibe',           icon: <Music size={22} />,           color: '#CC66BB', category: 'extras'    },
  { key: 'diamond',   label: 'Diamond',        icon: <GiDiamondRing size={22} />,   color: '#69C9D0', category: 'extras'    },
];

const GIFT_MAP = Object.fromEntries(ALL_GIFTS.map(g => [g.key, g]));

// ─── GiftIcon ─────────────────────────────────────────────────────────────────

function GiftIcon({ giftKey, size = 'md' }: { giftKey: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const gift = GIFT_MAP[giftKey ?? 'heart'] ?? GIFT_MAP['heart'];
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.4 : 1;
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{ color: gift.color, transform: `scale(${scale})`, transformOrigin: 'center' }}
    >
      {gift.icon}
    </span>
  );
}

// ─── Confetti canvas burst ────────────────────────────────────────────────────

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  alpha: number;
  shape: 'rect' | 'circle' | 'star';
}

function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef    = useRef<number>(0);
  const running   = useRef(false);

  const burst = useCallback((giftColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Build a palette from the gift colour + gold + green
    const palette = [giftColor, '#D4AF37', '#9AB800', '#F5E070', '#FFB7C5', '#FF6B35', '#69C9D0'];
    const count   = 120;

    particles.current = Array.from({ length: count }, () => {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 4 + Math.random() * 8;
      return {
        x:         canvas.width  / 2,
        y:         canvas.height / 2,
        vx:        Math.cos(angle) * speed,
        vy:        Math.sin(angle) * speed - 3, // slight upward bias
        size:      4 + Math.random() * 7,
        color:     palette[Math.floor(Math.random() * palette.length)],
        rotation:  Math.random() * Math.PI * 2,
        rotSpeed:  (Math.random() - 0.5) * 0.25,
        alpha:     1,
        shape:     (['rect','circle','star'] as const)[Math.floor(Math.random() * 3)],
      };
    });

    if (!running.current) {
      running.current = true;
      animate();
    }
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    for (const p of particles.current) {
      if (p.alpha <= 0) continue;
      alive = true;

      p.x        += p.vx;
      p.y        += p.vy;
      p.vy       += 0.25; // gravity
      p.vx       *= 0.99; // drag
      p.rotation += p.rotSpeed;
      p.alpha    -= 0.013;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 5-pointed star
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const r     = i % 2 === 0 ? p.size / 2 : p.size / 5;
          i === 0
            ? ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
            : ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    if (alive) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      running.current = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { canvasRef, burst };
}

// ─── Fallback messages ────────────────────────────────────────────────────────

const FALLBACK_MESSAGES: SupporterMessage[] = [
  { id:'f1', name:'Coach Williams',    location:'Tulsa, OK',       amount:'$50', message:"Sammie works harder than any athlete I've coached. This girl is going to the top — proud to support the journey.", platform:'CashApp', featured:true,  pinned:true,  emoji:'trophy',    createdAt:'2025-04-13T00:00:00Z' },
  { id:'f2', name:'The Johnson Family',location:'Broken Arrow, OK',amount:'$25', message:'We watch every meet. That 11.80s gave us chills. Keep running, Sammie! Tulsa is behind you.',                       platform:'Venmo',   featured:false, pinned:false, emoji:'sunflower', createdAt:'2025-04-10T00:00:00Z' },
  { id:'f3', name:'Auntie Renée',      location:'Oklahoma City',   amount:null,  message:'So proud of my niece. From that first field day to Top 5 in the state — what a journey. Love you, Sammie.',         platform:'Zelle',   featured:false, pinned:false, emoji:'rose',      createdAt:'2025-04-08T00:00:00Z' },
  { id:'f4', name:'Union HS Track Fan',location:'Tulsa, OK',       amount:'$10', message:'Came out to watch the Tulsa Invitational and witnessed that PR in person. Small contribution, big belief.',          platform:'CashApp', featured:false, pinned:false, emoji:'fire',      createdAt:'2025-04-05T00:00:00Z' },
  { id:'f5', name:'Mr. & Mrs. Davis',  location:'Jenks, OK',       amount:'$30', message:"Our daughter runs with Sammie. The way she pushes the whole team to be better — that's a leader. Keep going!",      platform:'Venmo',   featured:false, pinned:false, emoji:'crown',     createdAt:'2025-03-28T00:00:00Z' },
  { id:'f6', name:'Anonymous',         location:null,              amount:'$20', message:'Anonymous but rooting for you every meet. Go get that state title. Oklahoma needs a champion.',                       platform:'CashApp', featured:false, pinned:false, emoji:'bolt',      createdAt:'2025-03-20T00:00:00Z' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const platformColors: Record<string, string> = {
  CashApp: '#00D632', Venmo: '#3D95CE', Zelle: '#6B1BE3', GoFundMe: '#00B964',
};

// ─── Gift picker ──────────────────────────────────────────────────────────────

const GiftPicker: React.FC<{
  selected: string;
  onChange: (key: string) => void;
}> = ({ selected, onChange }) => {
  const [activeCategory, setActiveCategory] = useState<GiftCategory>('all');
  const [hovered, setHovered]               = useState<string | null>(null);

  const visible = activeCategory === 'all'
    ? ALL_GIFTS
    : ALL_GIFTS.filter(g => g.category === activeCategory);

  return (
    <div>
      <label className="block text-[#D4AF37]/55 text-xs font-semibold uppercase tracking-wider mb-2">
        Choose a gift to send
      </label>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-150"
            style={{
              background:  activeCategory === tab.key ? '#D4AF37' : 'rgba(212,175,55,0.08)',
              color:       activeCategory === tab.key ? '#0F1A08' : 'rgba(212,175,55,0.55)',
              border:      `1px solid ${activeCategory === tab.key ? '#D4AF37' : 'rgba(212,175,55,0.15)'}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gift grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 min-h-[88px]">
        {visible.map(gift => (
          <div key={gift.key} className="relative flex flex-col items-center">
            <button
              type="button"
              onClick={() => onChange(gift.key)}
              onMouseEnter={() => setHovered(gift.key)}
              onMouseLeave={() => setHovered(null)}
              className="w-full aspect-square rounded-xl flex items-center justify-center border transition-all duration-150"
              style={{
                background:  selected === gift.key ? `${gift.color}22` : 'rgba(10,16,5,0.7)',
                borderColor: selected === gift.key ? `${gift.color}60` : 'rgba(212,175,55,0.12)',
                transform:   selected === gift.key ? 'scale(1.12)' : 'scale(1)',
                color:       gift.color,
              }}
            >
              {gift.icon}
            </button>

            {/* Hover tooltip */}
            {hovered === gift.key && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-2 py-1 rounded-lg bg-[#1a2d0a] border border-[#D4AF37]/20 text-[#F5F0E8]/80 text-[10px] font-medium pointer-events-none shadow-lg">
                {gift.label}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected preview */}
      {selected && GIFT_MAP[selected] && (
        <div className="mt-3 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0a1005] border border-[#D4AF37]/12">
          <GiftIcon giftKey={selected} size="sm" />
          <span className="text-[#F5F0E8]/50 text-xs">
            Sending a{' '}
            <span className="font-medium" style={{ color: GIFT_MAP[selected].color }}>
              {GIFT_MAP[selected].label}
            </span>
            {' '}to Sammie
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Message card ─────────────────────────────────────────────────────────────

const MessageCard: React.FC<{ msg: SupporterMessage; index: number }> = ({ msg, index }) => {
  const platColor = msg.platform ? (platformColors[msg.platform] ?? '#D4AF37') : '#D4AF37';
  const gift      = GIFT_MAP[msg.emoji ?? 'heart'] ?? GIFT_MAP['heart'];

  return (
    <div
      className={`group relative rounded-2xl border p-5 transition-all duration-300 opacity-0 anim-fade-up overflow-hidden
        ${msg.pinned
          ? 'bg-[#D4AF37]/8 border-[#D4AF37]/30 hover:border-[#D4AF37]/50'
          : msg.featured
          ? 'bg-[#1a2d0a]/70 border-[#D4AF37]/20 hover:border-[#D4AF37]/40 sm:col-span-2'
          : 'bg-[#1a2d0a]/50 border-[#D4AF37]/10 hover:border-[#D4AF37]/30'
        }`}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      {/* Pinned badge */}
      {msg.pinned && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/25">
          <Pin size={9} className="text-[#D4AF37]" />
          <span className="text-[#D4AF37] text-[9px] font-bold tracking-wider uppercase">Pinned</span>
        </div>
      )}

      {/* Gift icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border"
        style={{ background: `${gift.color}18`, borderColor: `${gift.color}35`, color: gift.color }}
      >
        {gift.icon}
      </div>

      {/* Message */}
      <p className={`text-[#F5F0E8]/75 leading-relaxed mb-4 ${msg.featured ? 'text-sm' : 'text-xs'}`}>
        "{msg.message}"
      </p>

      {/* Footer */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white text-xs font-semibold">{msg.name}</span>
            {msg.amount && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: `${platColor}18`, color: platColor, border: `1px solid ${platColor}35` }}
              >
                {msg.amount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {msg.location && (
              <span className="flex items-center gap-1 text-[#F5F0E8]/30 text-[10px]">
                <MapPin size={8} /> {msg.location}
              </span>
            )}
            {msg.platform && (
              <span className="text-[10px] font-medium" style={{ color: `${platColor}80` }}>
                via {msg.platform}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px]" style={{ color: `${gift.color}80` }}>
              <GiftIcon giftKey={msg.emoji} size="sm" />
              {gift.label}
            </span>
          </div>
        </div>
        <span className="text-[#F5F0E8]/25 text-[10px] flex-shrink-0">{timeAgo(msg.createdAt)}</span>
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.03) 0%,transparent 60%)' }} />
    </div>
  );
};

// ─── Submit form ──────────────────────────────────────────────────────────────

const SubmitForm: React.FC<{ onSuccess: (giftKey: string) => void }> = ({ onSuccess }) => {
  const [form, setForm]       = useState<MessageForm>(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<keyof MessageForm, boolean>>>({});
  const [sent, setSent]       = useState(false);
  const [sendError, setSendError] = useState(false);

  const [submit, { loading }] = useMutation(SUBMIT_MESSAGE);

  const set   = (k: keyof MessageForm, v: string) => setForm(f => ({ ...f, [k]: v }));
  const touch = (k: keyof MessageForm) => setTouched(t => ({ ...t, [k]: true }));

  const errors = {
    name:    !form.name.trim()               ? 'Your name is required' : '',
    message: form.message.trim().length < 10 ? 'Please write at least 10 characters' : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, message: true });
    if (hasErrors) return;
    setSendError(false);
    try {
      await submit({
        variables: {
          input: {
            name:     form.name.trim(),
            location: form.location.trim() || undefined,
            amount:   form.amount.trim()   || undefined,
            message:  form.message.trim(),
            platform: form.platform        || undefined,
            emoji:    form.emoji           || 'heart',
          },
        },
      });
      onSuccess(form.emoji || 'heart'); // fire confetti burst in parent
      setSent(true);
    } catch {
      setSendError(true);
    }
  };

  const inputCls = "w-full bg-[#0a1005] border border-[#D4AF37]/18 rounded-xl px-4 py-2.5 text-[#F5F0E8] text-sm placeholder-[#F5F0E8]/18 focus:outline-none focus:border-[#D4AF37]/50 transition-colors";
  const labelCls = "block text-[#D4AF37]/55 text-xs font-semibold uppercase tracking-wider mb-1.5";

  const gift = GIFT_MAP[form.emoji] ?? GIFT_MAP['heart'];

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center border"
          style={{ background: `${gift.color}18`, borderColor: `${gift.color}35`, color: gift.color }}
        >
          {gift.icon}
        </div>
        <h4 className="font-display text-lg font-bold text-white">
          Your {gift.label} is on its way to Sammie!
        </h4>
        <p className="text-[#F5F0E8]/45 text-sm max-w-xs leading-relaxed">
          Your message will appear on the wall once reviewed. Sammie and her family are grateful.
        </p>
        <button
          onClick={() => { setSent(false); setForm(emptyForm); setTouched({}); }}
          className="flex items-center gap-1.5 text-[#D4AF37]/50 hover:text-[#D4AF37] text-xs transition-colors mt-1"
        >
          <RefreshCw size={11} /> Send another gift
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <GiftPicker selected={form.emoji} onChange={v => set('emoji', v)} />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Your name *</label>
          <input className={inputCls} value={form.name}
            onChange={e => set('name', e.target.value)}
            onBlur={() => touch('name')}
            placeholder="Coach Smith" />
          {touched.name && errors.name && (
            <p className="text-red-400/75 text-xs mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <label className={labelCls}>Location <span className="normal-case tracking-normal text-[#F5F0E8]/25 text-[11px]">(optional)</span></label>
          <input className={inputCls} value={form.location}
            onChange={e => set('location', e.target.value)}
            placeholder="Tulsa, OK" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Your message *</label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          value={form.message}
          onChange={e => set('message', e.target.value)}
          onBlur={() => touch('message')}
          placeholder="Share a word of encouragement for Sammie…"
        />
        {touched.message && errors.message && (
          <p className="text-red-400/75 text-xs mt-1">{errors.message}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Donation amount <span className="normal-case tracking-normal text-[#F5F0E8]/25 text-[11px]">(optional)</span></label>
          <input className={inputCls} value={form.amount}
            onChange={e => set('amount', e.target.value)}
            placeholder="$25" />
        </div>
        <div>
          <label className={labelCls}>Donated via <span className="normal-case tracking-normal text-[#F5F0E8]/25 text-[11px]">(optional)</span></label>
          <select className={inputCls} value={form.platform}
            onChange={e => set('platform', e.target.value)}>
            <option value="">Select platform…</option>
            <option value="CashApp">Cash App</option>
            <option value="Venmo">Venmo</option>
            <option value="Zelle">Zelle</option>
            <option value="GoFundMe">GoFundMe</option>
          </select>
        </div>
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
        {loading ? 'Sending…' : `Send your ${gift.label} to Sammie`}
      </button>

      <p className="text-[#F5F0E8]/22 text-xs text-center">
        Messages are reviewed before appearing on the wall.
      </p>
    </form>
  );
};

// ─── Main section ─────────────────────────────────────────────────────────────

const PREVIEW_COUNT = 6;

export const SupporterWall: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const { canvasRef, burst }  = useConfetti();

  const { data, loading } = useQuery(GET_SUPPORTER_MESSAGES, { errorPolicy: 'all' });
  const live: SupporterMessage[]  = (data as any)?.supporterMessages ?? [];
  const messages = live.length > 0 ? live : FALLBACK_MESSAGES;

  const displayed = showAll ? messages : messages.slice(0, PREVIEW_COUNT);
  const hasMore   = messages.length > PREVIEW_COUNT;

  const handleSuccess = useCallback((giftKey: string) => {
    const gift = GIFT_MAP[giftKey] ?? GIFT_MAP['heart'];
    burst(gift.color);
  }, [burst]);

  return (
    <section id="supporter-wall" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1807] via-[#0F1A08] to-[#0a1005]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 border-r border-[#D4AF37]"
            style={{ left: `${(i + 1) * 12.5}%` }} />
        ))}
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-48 bg-[#D4AF37]/4 rounded-full blur-3xl pointer-events-none" />

      {/* Confetti canvas — full section overlay, pointer-events none */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        style={{ display: 'block' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12 anim-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/8 mb-5">
            <FaHeart size={12} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase">
              {messages.length} supporter{messages.length !== 1 ? 's' : ''}
            </span>
            <FaHeart size={12} className="text-[#D4AF37]" />
          </div>
          <h2 className="font-display text-5xl sm:text-6xl font-black text-white mb-4">
            Supporter <span className="text-shimmer">Wall</span>
          </h2>
          <p className="text-[#F5F0E8]/45 text-sm max-w-md mx-auto leading-relaxed">
            Every gift and message is a reminder of who's in Sammie's corner.
            Donate and send your love to the wall.
          </p>
        </div>

        {/* Two-column: wall left, form right */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Message wall */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader size={20} className="text-[#D4AF37]/40 animate-spin" />
              </div>
            )}

            {!loading && (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  {displayed.map((msg, i) => (
                    <MessageCard key={msg.id} msg={msg} index={i} />
                  ))}
                </div>

                {hasMore && !showAll && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setShowAll(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D4AF37]/22 bg-[#D4AF37]/6 text-[#D4AF37]/75 text-sm font-medium hover:bg-[#D4AF37]/14 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all group"
                    >
                      Show all {messages.length} messages
                      <ChevronDown size={13} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-[#D4AF37]/15 rounded-3xl">
                    <GiRose size={32} className="text-[#D4AF37]/20 mx-auto mb-3" />
                    <p className="text-[#F5F0E8]/35 text-sm">No messages yet — be the first to show support.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Submit form — sticky */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a2d0a]/55 border border-[#D4AF37]/15 rounded-3xl p-6 sticky top-28">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#E1306C]/12 flex items-center justify-center flex-shrink-0">
                  <GiRose size={18} className="text-[#E1306C]/80" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white leading-tight">
                    Send a gift
                  </h3>
                  <p className="text-[#F5F0E8]/38 text-xs mt-0.5">
                    Leave your mark on Sammie's wall
                  </p>
                </div>
              </div>

              <SubmitForm onSuccess={handleSuccess} />
            </div>
          </div>

        </div>

        {/* Live indicator */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#D4AF37]/18 bg-[#D4AF37]/5">
            <div className="w-2 h-2 rounded-full bg-[#9AB800] animate-pulse" />
            <span className="text-[#D4AF37]/55 text-sm">Wall updates after every donation…</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SupporterWall;