/**
 * VideoSection — public video highlights on the homepage.
 *
 * Layout:
 *  - One featured video at full width (if any marked featured)
 *  - Category filter tabs
 *  - Grid of thumbnail cards
 *  - Clicking any card opens a lightbox modal with the embedded player
 *
 * No external libraries — uses native iframe embeds and CSS.
 * The lightbox traps focus and closes on Escape or backdrop click.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import { Play, X, Film } from 'lucide-react';
import { GET_VIDEOS } from '../lib/queries';
import { videoCategoryConfig } from '../lib/videoUtils';

interface VideoHighlight {
  id: string; title: string; url: string; embedUrl: string;
  thumbnail: string | null; category: string; featured: boolean; order: number;
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
const Lightbox: React.FC<{
  video: VideoHighlight;
  onClose: () => void;
}> = ({ video, onClose }) => {

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    // Prevent body scroll while lightbox is open
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/50 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
        >
          <X size={16} /> Close
        </button>

        {/* 16:9 iframe wrapper */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={video.embedUrl + '&autoplay=1'}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Title below player */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <h3 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            {video.title}
          </h3>
          <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${videoCategoryConfig[video.category]?.bg} ${videoCategoryConfig[video.category]?.color}`}>
            {videoCategoryConfig[video.category]?.label ?? video.category}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Thumbnail card ─────────────────────────────────────────────────────────────
const VideoCard: React.FC<{
  video: VideoHighlight;
  onClick: () => void;
  large?: boolean;
}> = ({ video, onClick, large = false }) => {
  const [imgError, setImgError] = useState(false);
  const cat = videoCategoryConfig[video.category] ?? videoCategoryConfig.OTHER;

  return (
    <button
      onClick={onClick}
      className={`group relative w-full rounded-2xl overflow-hidden bg-[#0F1A08] border border-[#D4AF37]/15 hover:border-[#D4AF37]/50 transition-all duration-300 text-left ${large ? 'aspect-video' : 'aspect-video'}`}
    >
      {/* Thumbnail */}
      {video.thumbnail && !imgError ? (
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#1a2d0a]/60">
          <Film size={large ? 48 : 28} className="text-[#D4AF37]/20" />
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A08]/90 via-[#0F1A08]/20 to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`rounded-full bg-[#D4AF37] group-hover:scale-110 transition-transform duration-300 flex items-center justify-center shadow-lg ${large ? 'w-16 h-16' : 'w-11 h-11'}`}>
          <Play
            className="text-[#0F1A08] fill-[#0F1A08] ml-0.5"
            size={large ? 26 : 18}
          />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cat.bg} ${cat.color}`}>
            {cat.label}
          </span>
          {video.featured && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
              Featured
            </span>
          )}
        </div>
        <h3 className={`text-white font-bold leading-tight ${large ? 'text-xl sm:text-2xl' : 'text-sm'}`}
          style={large ? { fontFamily: 'Playfair Display, serif' } : {}}>
          {video.title}
        </h3>
      </div>
    </button>
  );
};

// ── Main section ──────────────────────────────────────────────────────────────
const ALL = 'ALL';

export const VideoSection: React.FC = () => {
  const { data, loading } = useQuery<{ videos: VideoHighlight[] }>(GET_VIDEOS);
  const [activeFilter, setActiveFilter] = useState<string>(ALL);
  const [lightboxVideo, setLightboxVideo] = useState<VideoHighlight | null>(null);

  const openVideo = useCallback((v: VideoHighlight) => setLightboxVideo(v), []);
  const closeVideo = useCallback(() => setLightboxVideo(null), []);

  const videos = data?.videos ?? [];
  if (!loading && videos.length === 0) return null;

  const featured = videos.find(v => v.featured);
  const rest     = videos.filter(v => !v.featured);

  // Build filter tabs from categories that actually have videos
  const categories = [ALL, ...Array.from(new Set(videos.map(v => v.category)))];

  const filtered = activeFilter === ALL
    ? rest
    : rest.filter(v => v.category === activeFilter);

  return (
    <section id="videos" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1807] via-[#0F1A08] to-[#0d1807]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#D4AF37]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">
            Watch Her Run
          </p>
          <h2 className="font-black text-5xl sm:text-6xl text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            Video{' '}
            <span style={{
              backgroundImage: 'linear-gradient(135deg, #D4AF37 0%, #9AB800 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Highlights
            </span>
          </h2>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-6">
            <div className="w-full aspect-video rounded-2xl bg-[#D4AF37]/5 animate-pulse" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-video rounded-2xl bg-[#D4AF37]/5 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Featured video — full width */}
            {featured && (
              <div className="mb-10">
                <VideoCard video={featured} onClick={() => openVideo(featured)} large />
              </div>
            )}

            {/* Category filter tabs */}
            {rest.length > 0 && categories.length > 2 && (
              <div className="flex flex-wrap gap-2 mb-8 justify-center">
                {categories.map(cat => {
                  const cfg = cat === ALL ? null : videoCategoryConfig[cat];
                  const isActive = activeFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveFilter(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[#D4AF37] text-[#0F1A08]'
                          : 'bg-[#D4AF37]/10 text-[#F5F0E8]/50 hover:text-[#F5F0E8]/80 hover:bg-[#D4AF37]/20'
                      }`}
                    >
                      {cat === ALL ? 'All' : cfg?.label ?? cat}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Grid of remaining videos */}
            {filtered.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(v => (
                  <VideoCard key={v.id} video={v} onClick={() => openVideo(v)} />
                ))}
              </div>
            )}

            {/* Empty filtered state */}
            {filtered.length === 0 && rest.length > 0 && (
              <p className="text-center text-[#F5F0E8]/30 text-sm py-8">
                No videos in this category yet.
              </p>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightboxVideo && (
        <Lightbox video={lightboxVideo} onClose={closeVideo} />
      )}
    </section>
  );
};
