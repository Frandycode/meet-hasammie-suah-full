/**
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 * Meet HaSammie Suah — News / Blog Section
 *
 * Drop into: src/components/NewsSection.tsx
 * Add <NewsSection /> to src/pages/HomePage.tsx (after AchievementsSection)
 *
 * GraphQL query for this section is included at the bottom of this file.
 * Wire it in by importing GET_BLOG_POSTS and using useQuery.
 */

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Calendar, Tag, ArrowRight, BookOpen, ChevronDown, Loader } from 'lucide-react';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

export const GET_BLOG_POSTS = gql`
  query GetBlogPosts($category: BlogCategory) {
    blogPosts(publishedOnly: true, category: $category) {
      id title slug excerpt coverUrl category tags
      published featured publishedAt createdAt
    }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  id:          string;
  title:       string;
  slug:        string;
  excerpt:     string;
  coverUrl:    string | null;
  category:    'NEWS' | 'TRAINING' | 'PERSONAL' | 'MEDIA';
  tags:        string[];
  featured:    boolean;
  publishedAt: string | null;
  createdAt:   string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const categoryConfig: Record<BlogPost['category'], { label: string; color: string; bg: string; border: string }> = {
  NEWS:     { label: 'Race News',  color: '#D4AF37', bg: 'rgba(212,175,55,0.12)',  border: 'rgba(212,175,55,0.3)'  },
  TRAINING: { label: 'Training',   color: '#9AB800', bg: 'rgba(154,184,0,0.12)',   border: 'rgba(154,184,0,0.3)'   },
  PERSONAL: { label: 'Personal',   color: '#7A9B00', bg: 'rgba(122,155,0,0.12)',   border: 'rgba(122,155,0,0.3)'   },
  MEDIA:    { label: 'Media',      color: '#F5E070', bg: 'rgba(245,224,112,0.12)', border: 'rgba(245,224,112,0.3)' },
};

const allCategories: Array<{ key: BlogPost['category'] | 'ALL'; label: string }> = [
  { key: 'ALL',      label: 'All' },
  { key: 'NEWS',     label: 'Race News' },
  { key: 'TRAINING', label: 'Training' },
  { key: 'PERSONAL', label: 'Personal' },
  { key: 'MEDIA',    label: 'Media' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Fallback posts (shown when API is loading or empty) ─────────────────────

const FALLBACK_POSTS: BlogPost[] = [
  {
    id: 'fb-1', title: 'New Personal Record — 11.80s at Tulsa Invitational', slug: 'pr-1180-tulsa-invitational',
    excerpt: "It finally happened. After months of early-morning practice sessions and pushing through the cold Oklahoma winters, I crossed the line at 11.80 — a new personal best. Here's what went into that race.",
    coverUrl: null, category: 'NEWS', tags: ['100m','personal-record','tulsa'], featured: true,
    publishedAt: '2025-04-13T00:00:00Z', createdAt: '2025-04-13T00:00:00Z',
  },
  {
    id: 'fb-2', title: 'What My Pre-Race Routine Looks Like', slug: 'pre-race-routine-2025',
    excerpt: "People always ask me what I do the night before a big meet. Sleep, nutrition, visualisation — I break down the full routine that's helped me stay consistent this season.",
    coverUrl: null, category: 'TRAINING', tags: ['routine','mindset','training'], featured: false,
    publishedAt: '2025-03-20T00:00:00Z', createdAt: '2025-03-20T00:00:00Z',
  },
  {
    id: 'fb-3', title: 'State Championships 2024: What I Learned Finishing 4th', slug: 'state-2024-reflection',
    excerpt: "Fourth place. Not what I wanted, but exactly what I needed. Looking back at the 2024 Oklahoma 6A State Championships and the lessons that shaped my entire off-season.",
    coverUrl: null, category: 'PERSONAL', tags: ['state','reflection','growth'], featured: false,
    publishedAt: '2024-05-20T00:00:00Z', createdAt: '2024-05-20T00:00:00Z',
  },
  {
    id: 'fb-4', title: 'Tulsa World Feature — "The Girl Who Runs at Dawn"', slug: 'tulsa-world-feature',
    excerpt: 'The Tulsa World ran a feature on my story — from that first field day at age 10 to competing for a state title. Grateful for the platform to share the journey.',
    coverUrl: null, category: 'MEDIA', tags: ['press','interview','tulsa-world'], featured: false,
    publishedAt: '2025-02-10T00:00:00Z', createdAt: '2025-02-10T00:00:00Z',
  },
  {
    id: 'fb-5', title: 'Summer Speed Camp Recap: Oklahoma City, June 2025', slug: 'speed-camp-okc-2025',
    excerpt: "Three days, 40 athletes, and the fastest training I've ever done. My full recap of the Elite Speed Camp — the drills, the coaches, and what I'm taking into the fall.",
    coverUrl: null, category: 'TRAINING', tags: ['speed-camp','summer','training'], featured: false,
    publishedAt: '2025-06-25T00:00:00Z', createdAt: '2025-06-25T00:00:00Z',
  },
  {
    id: 'fb-6', title: 'District Champion — 200m, Broken Arrow 2024', slug: 'district-champion-200m-2024',
    excerpt: 'Crossed the line first in the 200m at the District Championship with a new PR of 24.51. A breakdown of the race, the split, and what it means heading into regionals.',
    coverUrl: null, category: 'NEWS', tags: ['200m','district','champion'], featured: false,
    publishedAt: '2024-04-27T00:00:00Z', createdAt: '2024-04-27T00:00:00Z',
  },
];

// ─── Featured card ────────────────────────────────────────────────────────────

const FeaturedCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const cfg = categoryConfig[post.category];
  return (
    <div className="group relative bg-[#1a2d0a]/60 border border-[#D4AF37]/15 rounded-3xl overflow-hidden hover:border-[#D4AF37]/40 transition-all duration-400 cursor-pointer anim-fade-up">
      {/* Cover image or gradient placeholder */}
      {post.coverUrl ? (
        <div className="relative h-52 overflow-hidden">
          <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A08] via-[#0F1A08]/30 to-transparent" />
        </div>
      ) : (
        <div className="h-52 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a3008] via-[#0F1A08] to-[#0a1005]" />
          {/* Decorative track lanes */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0 border-r border-[#D4AF37]" style={{ left: `${(i + 1) * 18}%` }} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={40} className="text-[#D4AF37]/20" />
          </div>
          {/* Featured badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            Featured
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {cfg.label}
          </span>
          <span className="text-[#F5F0E8]/35 text-xs flex items-center gap-1">
            <Calendar size={10} />{formatDate(post.publishedAt || post.createdAt)}
          </span>
        </div>

        <h3 className="font-display text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors mb-2 leading-tight">
          {post.title}
        </h3>
        <p className="text-[#F5F0E8]/55 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {post.tags.slice(0, 3).map(t => (
              <span key={t} className="inline-flex items-center gap-1 text-[10px] text-[#F5F0E8]/30 bg-[#F5F0E8]/5 px-2 py-0.5 rounded-full">
                <Tag size={8} />{t}
              </span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-[#D4AF37]/70 text-xs font-medium group-hover:gap-2 transition-all">
            Read more <ArrowRight size={12} />
          </span>
        </div>
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
        style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.03) 0%,transparent 60%)' }} />
    </div>
  );
};

// ─── Compact card ─────────────────────────────────────────────────────────────

const CompactCard: React.FC<{ post: BlogPost; index: number }> = ({ post, index }) => {
  const cfg = categoryConfig[post.category];
  return (
    <div
      className="group flex gap-4 bg-[#1a2d0a]/50 border border-[#D4AF37]/10 rounded-2xl p-4 hover:border-[#D4AF37]/35 hover:bg-[#1a2d0a]/80 transition-all duration-300 cursor-pointer relative overflow-hidden opacity-0 anim-fade-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      {/* Left accent bar */}
      <div className="flex-shrink-0 w-1 rounded-full self-stretch" style={{ background: cfg.color, opacity: 0.5 }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
          <span className="text-[#F5F0E8]/30 text-[10px] flex items-center gap-1">
            <Calendar size={9} />{formatDate(post.publishedAt || post.createdAt)}
          </span>
        </div>
        <h4 className="font-display text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug mb-1.5 line-clamp-2">
          {post.title}
        </h4>
        <p className="text-[#F5F0E8]/45 text-xs leading-relaxed line-clamp-2">{post.excerpt}</p>
      </div>

      <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight size={14} className="text-[#D4AF37]/70" />
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.03) 0%,transparent 60%)' }} />
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const NewsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<BlogPost['category'] | 'ALL'>('ALL');
  const [showAll, setShowAll] = useState(false);
  const PREVIEW = 5;

  // Try live data; fall back gracefully to sample posts while loading / on error
  const { data, loading, error } = useQuery(GET_BLOG_POSTS, {
    variables: { category: activeCategory === 'ALL' ? undefined : activeCategory },
    errorPolicy: 'all',
  });

  const livePosts: BlogPost[] = data?.blogPosts ?? [];
  const posts = livePosts.length > 0 ? livePosts : FALLBACK_POSTS;

  const filtered = activeCategory === 'ALL' ? posts : posts.filter(p => p.category === activeCategory);
  const featuredPost = filtered.find(p => p.featured) ?? filtered[0];
  const rest = filtered.filter(p => p.id !== featuredPost?.id);
  const displayedRest = showAll ? rest : rest.slice(0, PREVIEW - 1);

  return (
    <section id="news" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1A08] via-[#0a1405] to-[#0F1A08]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-[#9AB800]/4 rounded-full blur-3xl pointer-events-none" />

      {/* Track stripes */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 border-r border-[#D4AF37]" style={{ left: `${(i + 1) * 14.28}%` }} />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 anim-fade-up">
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">Stories from the Track</p>
          <h2 className="font-display text-5xl sm:text-6xl font-black text-white">
            News & <span className="text-shimmer">Updates</span>
          </h2>
          <p className="text-[#F5F0E8]/45 text-sm mt-4 max-w-md mx-auto leading-relaxed">
            Race recaps, training insights, personal reflections, and everything in between.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap anim-fade-up delay-1">
          {allCategories.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setActiveCategory(key as any); setShowAll(false); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border transition-all duration-200 ${
                activeCategory === key
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0F1A08]'
                  : 'border-[#D4AF37]/20 text-[#D4AF37]/60 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader size={24} className="text-[#D4AF37]/50 animate-spin" />
          </div>
        )}

        {/* Posts grid: featured (left, large) + compact list (right) */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Featured — takes 2 of 5 cols */}
            {featuredPost && (
              <div className="lg:col-span-2">
                <FeaturedCard post={featuredPost} />
              </div>
            )}

            {/* Compact list — takes 3 of 5 cols */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              {displayedRest.map((post, i) => (
                <CompactCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpen size={36} className="text-[#D4AF37]/20 mx-auto mb-4" />
            <p className="text-[#F5F0E8]/40 text-sm">No posts in this category yet — check back soon.</p>
          </div>
        )}

        {/* Show more */}
        {rest.length > PREVIEW - 1 && !showAll && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/8 text-[#D4AF37]/80 text-sm font-medium hover:bg-[#D4AF37]/15 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all duration-200 group"
            >
              Show all {filtered.length} posts
              <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* "More coming" indicator */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5">
            <div className="w-2 h-2 rounded-full bg-[#9AB800] animate-pulse" />
            <span className="text-[#D4AF37]/60 text-sm">New posts after every meet…</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
