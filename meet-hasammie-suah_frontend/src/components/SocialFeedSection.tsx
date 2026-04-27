/**
 * Meet HaSammie Suah — Social Feed Section (v2)
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 *
 * Changes from v1:
 *  - Platform tab bar: All · Instagram · TikTok · X
 *  - TikTok live wall slot (Behold) alongside the Instagram slot
 *  - Per-tab Behold embed swaps in when env var is set
 *  - Manual grid filters by active tab when no live feed is configured
 *
 * ── Switching to live feeds ───────────────────────────────────────────────────
 * Instagram: set VITE_BEHOLD_WIDGET_ID=your_instagram_widget_id   in .env
 * TikTok:    set VITE_BEHOLD_TIKTOK_ID=your_tiktok_widget_id      in .env
 *
 * Each platform tab checks its own widget ID independently — you can have
 * Instagram live while TikTok still shows the manual grid, or both live,
 * or neither. The manual grid is always the fallback.
 *
 * Drop into: src/components/SocialFeedSection.tsx (replace v1 entirely)
 */

import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  ExternalLink, Heart, Grid3X3, Loader,
} from 'lucide-react';
import {
  SiInstagram, SiTiktok, SiX,
} from 'react-icons/si';

// ─── Config ───────────────────────────────────────────────────────────────────

const BEHOLD_INSTAGRAM_ID = import.meta.env.VITE_BEHOLD_WIDGET_ID   as string | undefined;
const BEHOLD_TIKTOK_ID    = import.meta.env.VITE_BEHOLD_TIKTOK_ID   as string | undefined;

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_SOCIAL_POSTS = gql`
  query GetSocialPosts {
    socialPosts(publishedOnly: true) {
      id platform imageUrl caption postUrl likes featured order postedAt
    }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = 'INSTAGRAM' | 'TIKTOK' | 'TWITTER' | 'OTHER';
type TabKey   = 'ALL' | 'INSTAGRAM' | 'TIKTOK' | 'TWITTER';

interface SocialPost {
  id:       string;
  platform: Platform;
  imageUrl: string;
  caption:  string;
  postUrl:  string;
  likes:    number | null;
  featured: boolean;
  order:    number;
  postedAt: string;
}

// ─── Fallback posts ───────────────────────────────────────────────────────────

const FALLBACK_POSTS: SocialPost[] = [
  {
    id: 'fb-1', platform: 'INSTAGRAM', imageUrl: '',
    caption: '11.80s. New personal record. Locked in from the warm-up. No words. Just numbers. #100m #TrackAndField #OklahomaTrack',
    postUrl: 'https://instagram.com', likes: 847, featured: true, order: 0, postedAt: '2025-04-12T00:00:00Z',
  },
  {
    id: 'fb-2', platform: 'INSTAGRAM', imageUrl: '',
    caption: 'District champion. 200m. See you at regionals. #DistrictChamp #200m #Union',
    postUrl: 'https://instagram.com', likes: 622, featured: false, order: 1, postedAt: '2025-04-26T00:00:00Z',
  },
  {
    id: 'fb-3', platform: 'TIKTOK', imageUrl: '',
    caption: 'POV: you just set a PR and the crowd goes crazy. #TrackLife #SprintLife #POV',
    postUrl: 'https://tiktok.com', likes: 12400, featured: true, order: 2, postedAt: '2025-04-13T00:00:00Z',
  },
  {
    id: 'fb-4', platform: 'TIKTOK', imageUrl: '',
    caption: 'Training at 5am so nobody can say it was handed to me. #GrindSeason #TrackLife',
    postUrl: 'https://tiktok.com', likes: 8200, featured: false, order: 3, postedAt: '2025-04-06T00:00:00Z',
  },
  {
    id: 'fb-5', platform: 'INSTAGRAM', imageUrl: '',
    caption: 'State 2025, we are coming. Three weeks out. Every morning matters. #StateChampionships',
    postUrl: 'https://instagram.com', likes: 534, featured: false, order: 4, postedAt: '2025-04-18T00:00:00Z',
  },
  {
    id: 'fb-6', platform: 'TWITTER', imageUrl: '',
    caption: 'The grind is the goal. See you on the track.',
    postUrl: 'https://twitter.com', likes: 201, featured: false, order: 5, postedAt: '2025-03-30T00:00:00Z',
  },
  {
    id: 'fb-7', platform: 'TIKTOK', imageUrl: '',
    caption: 'Slow motion of the PR run — watch the drive phase off the blocks. #100m #SprintMechanics',
    postUrl: 'https://tiktok.com', likes: 19600, featured: false, order: 6, postedAt: '2025-04-14T00:00:00Z',
  },
];

// ─── Platform config ──────────────────────────────────────────────────────────

const platformConfig: Record<Platform, {
  icon:   React.ReactNode;
  label:  string;
  color:  string;
  handle: string;
}> = {
  INSTAGRAM: { icon: <SiInstagram size={13} />, label: 'Instagram', color: '#E1306C', handle: '@sammie.runs'  },
  TIKTOK:    { icon: <SiTiktok    size={13} />, label: 'TikTok',    color: '#69C9D0', handle: '@sammiesuah'   },
  TWITTER:   { icon: <SiX         size={13} />, label: 'X',         color: '#1DA1F2', handle: '@sammiesuah'   },
  OTHER:     { icon: <ExternalLink size={13}/>, label: 'Social',    color: '#D4AF37', handle: ''              },
};

const TAB_CONFIG: Array<{ key: TabKey; label: string; icon: React.ReactNode; color: string }> = [
  { key: 'ALL',       label: 'All',       icon: <Grid3X3 size={12} />,    color: '#D4AF37' },
  { key: 'INSTAGRAM', label: 'Instagram', icon: <SiInstagram size={12} />, color: '#E1306C' },
  { key: 'TIKTOK',    label: 'TikTok',    icon: <SiTiktok size={12} />,    color: '#69C9D0' },
  { key: 'TWITTER',   label: 'X',         icon: <SiX size={12} />,         color: '#1DA1F2' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLikes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Post card ────────────────────────────────────────────────────────────────

const PostCard: React.FC<{ post: SocialPost; size: 'large' | 'normal' }> = ({ post, size }) => {
  const [imgError, setImgError] = useState(false);
  const cfg = platformConfig[post.platform];

  const gradients: Record<Platform, string> = {
    INSTAGRAM: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
    TIKTOK:    'linear-gradient(135deg, #010101 0%, #69C9D0 100%)',
    TWITTER:   'linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%)',
    OTHER:     'linear-gradient(135deg, #1a3008 0%, #0F1A08 100%)',
  };

  return (
    <a
      href={post.postUrl}
      target="_blank"
      rel="noreferrer"
      className={`group relative block rounded-2xl overflow-hidden border border-[#D4AF37]/10
        hover:border-[#D4AF37]/35 transition-all duration-300
        ${size === 'large' ? 'row-span-2' : ''}`}
      style={{ aspectRatio: size === 'large' ? '1 / 1.6' : '1 / 1' }}
    >
      {post.imageUrl && !imgError ? (
        <img
          src={post.imageUrl}
          alt={post.caption}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: gradients[post.platform] }}>
          <div className="absolute inset-0 opacity-10">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0 border-r border-white"
                style={{ left: `${(i + 1) * 18}%` }} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div style={{ transform: 'scale(3)', color: 'white' }}>{cfg.icon}</div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A08]/95 via-[#0F1A08]/30 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <div className="flex items-center justify-between mb-2">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold"
            style={{ background: `${cfg.color}25`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
          >
            {cfg.icon} {cfg.label}
          </div>
          <span className="text-[#F5F0E8]/35 text-[10px]">{timeAgo(post.postedAt)}</span>
        </div>

        <p className={`text-white leading-snug mb-2 line-clamp-3 ${size === 'large' ? 'text-sm' : 'text-xs'}`}>
          {post.caption}
        </p>

        {post.likes !== null && (
          <div className="flex items-center gap-1.5 text-[#F5F0E8]/45 text-xs">
            <Heart size={11} className="text-red-400/70" />
            <span>{formatLikes(post.likes)}</span>
          </div>
        )}
      </div>

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <ExternalLink size={11} className="text-white" />
        </div>
      </div>
    </a>
  );
};

// ─── Behold embed (lazy-loaded) ───────────────────────────────────────────────

const BeholdWall: React.FC<{ widgetId: string }> = ({ widgetId }) => {
  const ref    = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || loaded.current) return;
      loaded.current = true;
      const script   = document.createElement('script');
      script.src     = 'https://w.behold.so/widget.js';
      script.type    = 'module';
      document.head.appendChild(script);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full">
      {/* @ts-ignore */}
      <behold-widget feed-id={widgetId} />
    </div>
  );
};

// ─── Platform tab bar ─────────────────────────────────────────────────────────

const TabBar: React.FC<{
  active:   TabKey;
  posts:    SocialPost[];
  onChange: (tab: TabKey) => void;
}> = ({ active, posts, onChange }) => (
  <div className="flex items-center gap-2 flex-wrap mb-10 anim-fade-up delay-1">
    {TAB_CONFIG.map(tab => {
      const count = tab.key === 'ALL'
        ? posts.length
        : posts.filter(p => p.platform === tab.key).length;

      return (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all duration-200"
          style={{
            background:  active === tab.key ? tab.color : 'transparent',
            borderColor: active === tab.key ? tab.color : `${tab.color}30`,
            color:       active === tab.key ? '#0F1A08' : `${tab.color}80`,
          }}
        >
          {tab.icon}
          {tab.label}
          {count > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
              style={{
                background: active === tab.key ? 'rgba(0,0,0,0.2)' : `${tab.color}20`,
                color:      active === tab.key ? '#0F1A08'          : tab.color,
              }}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

// ─── Live feed indicator ──────────────────────────────────────────────────────

const FeedIndicator: React.FC<{ tab: TabKey }> = ({ tab }) => {
  const isInstagramLive = tab === 'INSTAGRAM' && Boolean(BEHOLD_INSTAGRAM_ID);
  const isTikTokLive    = tab === 'TIKTOK'    && Boolean(BEHOLD_TIKTOK_ID);
  const isLive          = isInstagramLive || isTikTokLive;

  return (
    <div className="mt-8 flex items-center justify-center gap-2 text-[#F5F0E8]/25 text-xs">
      {isLive ? (
        <>
          <div className="w-1.5 h-1.5 rounded-full bg-[#9AB800] animate-pulse" />
          Live feed · updated automatically
        </>
      ) : (
        <>
          <Grid3X3 size={11} />
          Curated posts · updated by Sammie
        </>
      )}
    </div>
  );
};

// ─── Main section ─────────────────────────────────────────────────────────────

export const SocialFeedSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');

  const { data, loading } = useQuery(GET_SOCIAL_POSTS, { errorPolicy: 'all' });
  const livePosts: SocialPost[] = data?.socialPosts ?? [];
  const allPosts  = livePosts.length > 0 ? livePosts : FALLBACK_POSTS;

  // Filter posts by active tab
  const filteredPosts = activeTab === 'ALL'
    ? allPosts
    : allPosts.filter(p => p.platform === activeTab);

  const featured = filteredPosts.find(p => p.featured) ?? filteredPosts[0];
  const rest      = filteredPosts.filter(p => p.id !== featured?.id).slice(0, 5);

  // Does the active tab have a live Behold feed?
  const showInstagramLive = activeTab === 'INSTAGRAM' && Boolean(BEHOLD_INSTAGRAM_ID);
  const showTikTokLive    = activeTab === 'TIKTOK'    && Boolean(BEHOLD_TIKTOK_ID);
  const showLiveFeed      = showInstagramLive || showTikTokLive;

  const handles = [
    { platform: 'INSTAGRAM' as Platform, url: 'https://instagram.com/sammie.runs' },
    { platform: 'TIKTOK'    as Platform, url: 'https://tiktok.com/@sammiesuah'    },
    { platform: 'TWITTER'   as Platform, url: 'https://twitter.com/sammiesuah'    },
  ];

  return (
    <section id="social" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1A08] via-[#0a1405] to-[#0F1A08]" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 border-r border-[#D4AF37]"
            style={{ left: `${(i + 1) * 12.5}%` }} />
        ))}
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#9AB800]/4 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 anim-fade-up">
          <div>
            <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">Off the Track</p>
            <h2 className="font-display text-5xl sm:text-6xl font-black text-white">
              Follow the <span className="text-shimmer">Journey</span>
            </h2>
          </div>

          {/* Follow buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {handles.map(h => {
              const cfg = platformConfig[h.platform];
              return (
                <a
                  key={h.platform}
                  href={h.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all duration-200 hover:scale-105"
                  style={{ borderColor: `${cfg.color}40`, color: cfg.color, background: `${cfg.color}12` }}
                >
                  {cfg.icon} {cfg.handle}
                </a>
              );
            })}
          </div>
        </div>

        {/* ── Tab bar ──────────────────────────────────────────────────────── */}
        <TabBar active={activeTab} posts={allPosts} onChange={setActiveTab} />

        {/* ── Content ──────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader size={22} className="text-[#D4AF37]/40 animate-spin" />
          </div>
        )}

        {!loading && (
          showLiveFeed ? (
            /* Live Behold wall for whichever platform tab is active */
            <div className="anim-fade-up delay-1">
              <BeholdWall widgetId={
                showInstagramLive ? BEHOLD_INSTAGRAM_ID! : BEHOLD_TIKTOK_ID!
              } />
            </div>
          ) : filteredPosts.length > 0 ? (
            /* Manual post grid filtered by active tab */
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 anim-fade-up delay-1"
              style={{ gridAutoRows: '200px' }}
            >
              {featured && <PostCard post={featured} size="large" />}
              {rest.map(post => <PostCard key={post.id} post={post} size="normal" />)}
            </div>
          ) : (
            /* Empty state for a tab with no posts yet */
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#D4AF37]/15 rounded-3xl anim-fade-up delay-1">
              <div className="text-[#D4AF37]/20 mb-3">
                {TAB_CONFIG.find(t => t.key === activeTab)?.icon}
              </div>
              <p className="text-[#F5F0E8]/30 text-sm">
                No {TAB_CONFIG.find(t => t.key === activeTab)?.label} posts yet — check back soon.
              </p>
            </div>
          )
        )}

        {/* ── Feed indicator ───────────────────────────────────────────────── */}
        {!loading && <FeedIndicator tab={activeTab} />}

        {/* ── More to come ─────────────────────────────────────────────────── */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5">
            <div className="w-2 h-2 rounded-full bg-[#9AB800] animate-pulse" />
            <span className="text-[#D4AF37]/60 text-sm">New posts after every race…</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SocialFeedSection;
