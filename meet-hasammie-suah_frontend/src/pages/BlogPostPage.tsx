/**
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 * Meet HaSammie Suah — Blog Post Reader Page
 * Route: /blog/:slug
 *
 * Integration steps:
 *  1. Drop this file into src/pages/BlogPostPage.tsx
 *  2. Add to App.tsx (inside AppRoutes, alongside /press-kit):
 *       <Route path="/blog/:slug" element={<ErrorBoundary><BlogPostPage /></ErrorBoundary>} />
 *  3. In NewsSection.tsx, wrap each card in:
 *       <Link to={`/blog/${post.slug}`}>...</Link>
 *  4. Add "News" to Navbar navLinks: { label: 'News', href: '#news' }
 *
 * Backend note:
 *  The GET_BLOG_POST query below requires the blogPost(slug) resolver
 *  from resolvers.blog.addition.ts to be wired in.
 */

import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  ArrowLeft, Calendar, Tag, Clock,
  Copy, Check, Share2, ChevronRight,
} from 'lucide-react';
import { SiX } from 'react-icons/si';
import { useState } from 'react';
import { Navbar }  from '../components/Navbar';
import { Footer }  from '../components/Footer';
import { ErrorBoundary } from '../components/ErrorBoundary';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_BLOG_POST = gql`
  query GetBlogPost($slug: String!) {
    blogPost(slug: $slug) {
      id title slug excerpt content coverUrl
      category tags published featured
      publishedAt createdAt updatedAt
    }
  }
`;

const GET_RELATED_POSTS = gql`
  query GetRelatedPosts($category: BlogCategory) {
    blogPosts(publishedOnly: true, category: $category) {
      id title slug excerpt category publishedAt createdAt
    }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

type BlogCategory = 'NEWS' | 'TRAINING' | 'PERSONAL' | 'MEDIA';

interface BlogPost {
  id:          string;
  title:       string;
  slug:        string;
  excerpt:     string;
  content:     string;
  coverUrl:    string | null;
  category:    BlogCategory;
  tags:        string[];
  featured:    boolean;
  publishedAt: string | null;
  createdAt:   string;
  updatedAt:   string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const categoryConfig: Record<BlogCategory, { label: string; color: string; bg: string; border: string }> = {
  NEWS:     { label: 'Race News',  color: '#D4AF37', bg: 'rgba(212,175,55,0.12)',  border: 'rgba(212,175,55,0.3)'  },
  TRAINING: { label: 'Training',   color: '#9AB800', bg: 'rgba(154,184,0,0.12)',   border: 'rgba(154,184,0,0.3)'   },
  PERSONAL: { label: 'Personal',   color: '#7A9B00', bg: 'rgba(122,155,0,0.12)',   border: 'rgba(122,155,0,0.3)'   },
  MEDIA:    { label: 'Media',      color: '#F5E070', bg: 'rgba(245,224,112,0.12)', border: 'rgba(245,224,112,0.3)' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

/**
 * Minimal markdown renderer — handles the subset Sammie's posts will use.
 * For a production site, swap this for `react-markdown` + `remark-gfm`.
 *
 * Supported:
 *   # h1  ## h2  ### h3
 *   **bold**  *italic*  ~~strikethrough~~
 *   [text](url)
 *   > blockquote
 *   - unordered list  1. ordered list
 *   --- horizontal rule
 *   plain paragraphs with \n\n breaks
 */
function renderMarkdown(md: string): React.ReactNode[] {
  const blocks = md.split(/\n\n+/);

  return blocks.map((block, bi) => {
    const key = `block-${bi}`;
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      return <hr key={key} className="border-[#D4AF37]/15 my-8" />;
    }

    // Headings
    const h3 = trimmed.match(/^### (.+)/);
    if (h3) return (
      <h3 key={key} className="font-display text-2xl font-bold text-white mt-10 mb-4">
        {inlineMarkdown(h3[1])}
      </h3>
    );
    const h2 = trimmed.match(/^## (.+)/);
    if (h2) return (
      <h2 key={key} className="font-display text-3xl font-bold text-white mt-12 mb-5">
        {inlineMarkdown(h2[1])}
      </h2>
    );
    const h1 = trimmed.match(/^# (.+)/);
    if (h1) return (
      <h1 key={key} className="font-display text-4xl font-black text-white mt-14 mb-6">
        {inlineMarkdown(h1[1])}
      </h1>
    );

    // Blockquote
    if (trimmed.startsWith('>')) {
      const text = trimmed.replace(/^>\s?/gm, '');
      return (
        <blockquote key={key}
          className="border-l-2 border-[#D4AF37]/50 pl-5 py-1 my-6 italic text-[#F5F0E8]/70 text-lg"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          {inlineMarkdown(text)}
        </blockquote>
      );
    }

    // Unordered list
    if (/^[-*] /.test(trimmed)) {
      const items = trimmed.split('\n').filter(l => /^[-*] /.test(l));
      return (
        <ul key={key} className="space-y-2 my-5 pl-1">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-3 text-[#F5F0E8]/75">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 flex-shrink-0" />
              <span>{inlineMarkdown(item.replace(/^[-*] /, ''))}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Ordered list
    if (/^\d+\. /.test(trimmed)) {
      const items = trimmed.split('\n').filter(l => /^\d+\. /.test(l));
      return (
        <ol key={key} className="space-y-2 my-5 pl-1 counter-reset-list">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-3 text-[#F5F0E8]/75">
              <span className="flex-shrink-0 font-mono text-[#D4AF37]/60 text-sm w-5 text-right mt-0.5">{ii + 1}.</span>
              <span>{inlineMarkdown(item.replace(/^\d+\. /, ''))}</span>
            </li>
          ))}
        </ol>
      );
    }

    // Paragraph
    return (
      <p key={key} className="text-[#F5F0E8]/75 text-base leading-[1.85] my-5">
        {inlineMarkdown(trimmed)}
      </p>
    );
  }).filter(Boolean) as React.ReactNode[];
}

/** Inline markdown: bold, italic, strikethrough, links */
function inlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Process in order: links, bold, italic, strikethrough
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|~~([^~]+)~~)/g;
  let last = 0, match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    if (match[0].startsWith('[')) {
      // Link
      parts.push(
        <a key={match.index} href={match[3]} target="_blank" rel="noreferrer"
          className="text-[#D4AF37] underline underline-offset-2 decoration-[#D4AF37]/40 hover:decoration-[#D4AF37] transition-colors">
          {match[2]}
        </a>
      );
    } else if (match[0].startsWith('**')) {
      parts.push(<strong key={match.index} className="text-white font-semibold">{match[4]}</strong>);
    } else if (match[0].startsWith('*')) {
      parts.push(<em key={match.index} className="italic text-[#F5F0E8]/85">{match[5]}</em>);
    } else if (match[0].startsWith('~~')) {
      parts.push(<del key={match.index} className="opacity-50">{match[6]}</del>);
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : parts;
}

// ─── Copy link button ─────────────────────────────────────────────────────────

const CopyLinkButton: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37]/70 hover:bg-[#D4AF37]/12 hover:text-[#D4AF37] text-xs font-medium transition-all"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  );
};

// ─── Related post card ────────────────────────────────────────────────────────

const RelatedCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const cfg = categoryConfig[post.category];
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex gap-4 bg-[#1a2d0a]/50 border border-[#D4AF37]/10 rounded-2xl p-4 hover:border-[#D4AF37]/35 hover:bg-[#1a2d0a]/80 transition-all duration-300"
    >
      <div className="flex-shrink-0 w-1 rounded-full self-stretch" style={{ background: cfg.color, opacity: 0.5 }} />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
        <h4 className="font-display text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug mt-0.5 line-clamp-2">
          {post.title}
        </h4>
      </div>
      <ChevronRight size={14} className="flex-shrink-0 self-center text-[#D4AF37]/30 group-hover:text-[#D4AF37] transition-colors" />
    </Link>
  );
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────

const Skeleton: React.FC = () => (
  <div className="animate-pulse space-y-6 pt-10">
    <div className="h-3 w-24 bg-[#D4AF37]/10 rounded" />
    <div className="space-y-3">
      <div className="h-10 w-3/4 bg-[#D4AF37]/8 rounded" />
      <div className="h-10 w-1/2 bg-[#D4AF37]/8 rounded" />
    </div>
    <div className="h-4 w-48 bg-[#D4AF37]/5 rounded" />
    <div className="h-64 bg-[#1a2d0a]/40 rounded-2xl" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-4 bg-[#F5F0E8]/5 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
    ))}
  </div>
);

// ─── 404 / Not found state ────────────────────────────────────────────────────

const PostNotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center py-32">
      <p className="font-display text-7xl font-black text-[#D4AF37]/15 mb-6">404</p>
      <h2 className="font-display text-2xl font-bold text-white mb-3">Post not found</h2>
      <p className="text-[#F5F0E8]/45 text-sm mb-8">This post may have been removed or the link is incorrect.</p>
      <button
        onClick={() => navigate('/#news')}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4AF37] text-[#0F1A08] font-bold text-sm hover:bg-[#F5E070] transition-colors"
      >
        <ArrowLeft size={14} /> Back to news
      </button>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const progressRef = useRef<HTMLDivElement>(null);

  const { data, loading } = useQuery(GET_BLOG_POST, {
    variables: { slug },
    skip: !slug,
  });

  const post: BlogPost | null = data?.blogPost ?? null;

  const { data: relatedData } = useQuery(GET_RELATED_POSTS, {
    variables: { category: post?.category },
    skip: !post,
  });

  const relatedPosts: BlogPost[] = (relatedData?.blogPosts ?? [])
    .filter((p: BlogPost) => p.slug !== slug)
    .slice(0, 3);

  // Reading progress bar
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar) return;
    const onScroll = () => {
      const docH  = document.documentElement.scrollHeight - window.innerHeight;
      const prog  = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      bar.style.width = `${Math.min(100, prog)}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll to top on slug change
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const cfg = post ? categoryConfig[post.category] : null;
  const mins = post ? readingTime(post.content) : 0;

  return (
    <div className="min-h-screen bg-[#0F1A08]">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-[#D4AF37]/10 z-[60]">
        <div ref={progressRef} className="h-full bg-[#D4AF37] transition-none" style={{ width: '0%' }} />
      </div>

      <Navbar />

      <main className="pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-6">

          {loading && <Skeleton />}

          {!loading && !post && <PostNotFound />}

          {!loading && post && (
            <>
              {/* ── Back + breadcrumb ─────────────────────────────────────── */}
              <div className="flex items-center gap-2 text-xs text-[#F5F0E8]/35 mb-10 mt-4">
                <Link to="/#news" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1">
                  <ArrowLeft size={12} /> News
                </Link>
                <span>/</span>
                <span className="text-[#F5F0E8]/50 truncate max-w-[200px]">{post.title}</span>
              </div>

              {/* ── Category + meta ───────────────────────────────────────── */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase"
                  style={{ background: cfg!.bg, color: cfg!.color, border: `1px solid ${cfg!.border}` }}
                >
                  {cfg!.label}
                </span>
                <span className="text-[#F5F0E8]/35 text-xs flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
                <span className="text-[#F5F0E8]/35 text-xs flex items-center gap-1">
                  <Clock size={10} />
                  {mins} min read
                </span>
              </div>

              {/* ── Title ─────────────────────────────────────────────────── */}
              <h1 className="font-display text-4xl sm:text-5xl font-black text-white leading-[1.1] mb-6">
                {post.title}
              </h1>

              {/* ── Excerpt / lead ────────────────────────────────────────── */}
              <p className="text-[#F5F0E8]/60 text-lg leading-relaxed border-l-2 border-[#D4AF37]/35 pl-5 mb-10"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                {post.excerpt}
              </p>

              {/* ── Cover image ───────────────────────────────────────────── */}
              {post.coverUrl && (
                <div className="rounded-2xl overflow-hidden mb-10 border border-[#D4AF37]/12 aspect-[16/7]">
                  <img
                    src={post.coverUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* ── Article body ──────────────────────────────────────────── */}
              <article className="min-h-[300px]">
                {renderMarkdown(post.content)}
              </article>

              {/* ── Tags ──────────────────────────────────────────────────── */}
              {post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-10 pt-8 border-t border-[#D4AF37]/10">
                  <Tag size={12} className="text-[#D4AF37]/40" />
                  {post.tags.map(tag => (
                    <span key={tag}
                      className="px-3 py-1 rounded-full bg-[#D4AF37]/8 border border-[#D4AF37]/15 text-[#D4AF37]/60 text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* ── Share bar ─────────────────────────────────────────────── */}
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#D4AF37]/10 flex-wrap">
                <span className="text-[#F5F0E8]/35 text-xs font-medium flex items-center gap-1.5">
                  <Share2 size={11} /> Share
                </span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#D4AF37]/70 hover:bg-[#D4AF37]/12 hover:text-[#D4AF37] text-xs font-medium transition-all"
                >
                  <SiX size={12} /> Post on X
                </a>
                <CopyLinkButton />
              </div>

              {/* ── Author strip ──────────────────────────────────────────── */}
              <div className="flex items-center gap-4 mt-10 p-5 rounded-2xl bg-[#1a2d0a]/50 border border-[#D4AF37]/12">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#7A9B00] flex items-center justify-center text-[#0F1A08] font-black text-lg flex-shrink-0"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  S
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">HaSammie Suah</p>
                  <p className="text-[#F5F0E8]/40 text-xs mt-0.5">
                    Top 5 track runner in Oklahoma · Union High School · Class of 2027
                  </p>
                </div>
              </div>

              {/* ── Related posts ─────────────────────────────────────────── */}
              {relatedPosts.length > 0 && (
                <div className="mt-16">
                  <p className="text-[#D4AF37] text-xs font-bold tracking-[0.25em] uppercase mb-5">More from the blog</p>
                  <div className="space-y-3">
                    {relatedPosts.map(p => (
                      <RelatedCard key={p.id} post={p as BlogPost} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Back to news ──────────────────────────────────────────── */}
              <div className="mt-12 text-center">
                <Link
                  to="/#news"
                  className="inline-flex items-center gap-2 text-[#D4AF37]/55 hover:text-[#D4AF37] text-sm transition-colors"
                >
                  <ArrowLeft size={13} /> Back to all posts
                </Link>
              </div>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
