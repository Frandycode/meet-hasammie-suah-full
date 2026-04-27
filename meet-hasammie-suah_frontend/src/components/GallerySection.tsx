/**
 * Meet HaSammie Suah — Frontend
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, Image, PersonStanding,
  Dumbbell, Users, Trophy, Sparkles, LayoutGrid, RotateCcw,
  FolderOpen, ZoomIn,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import type { GalleryPhoto } from '../context/SiteContext';
import { LazyImage } from './LazyImage';

interface CategoryConfig { icon: React.ReactNode; bigIcon: React.ReactNode; label: string; }

const categoryConfig: Record<string, CategoryConfig> = {
  all:      { icon: <LayoutGrid size={13} />,     bigIcon: <LayoutGrid size={26} />,     label: 'All' },
  race:     { icon: <PersonStanding size={13} />, bigIcon: <PersonStanding size={26} />, label: 'Race Day' },
  training: { icon: <Dumbbell size={13} />,       bigIcon: <Dumbbell size={26} />,       label: 'Training' },
  team:     { icon: <Users size={13} />,          bigIcon: <Users size={26} />,          label: 'Team' },
  awards:   { icon: <Trophy size={13} />,         bigIcon: <Trophy size={26} />,         label: 'Awards' },
  personal: { icon: <Sparkles size={13} />,       bigIcon: <Sparkles size={26} />,       label: 'Personal' },
};

// ─── Folder Burst Overlay ────────────────────────────────────────────────────
const FolderBurst: React.FC<{
  category: string;
  photos: GalleryPhoto[];
  onClose: () => void;
  onOpenPhoto: (index: number) => void;
}> = ({ category, photos, onClose, onOpenPhoto }) => {
  const cfg = categoryConfig[category] || categoryConfig.personal;
  const [entered, setEntered] = useState(false);

  // trigger entrance animation after mount
  React.useEffect(() => {
    const t = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(10,16,4,0.92)',
        backdropFilter: 'blur(12px)',
        opacity: entered ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden border border-[#D4AF37]/25"
        style={{
          background: 'linear-gradient(135deg, #1a2d0a 0%, #0f1a08 100%)',
          transform: entered ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(30px)',
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#D4AF37]/15 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
              {cfg.bigIcon}
            </div>
            <div>
              <h3 className="font-display text-xl font-black text-white">{cfg.label}</h3>
              <p className="text-[#D4AF37]/50 text-xs">{photos.length} photo{photos.length !== 1 ? 's' : ''} in this folder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Photo grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Image size={40} className="text-[#D4AF37]/20" />
              <p className="text-[#F5F0E8]/30 text-sm">No photos in this folder yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => onOpenPhoto(i)}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-[#D4AF37]/10 hover:border-[#D4AF37]/50 transition-all duration-300 hover:scale-[1.03] focus:outline-none"
                  style={{
                    animationDelay: `${i * 40}ms`,
                    animation: 'burstIn 0.4s ease forwards',
                    opacity: 0,
                  }}
                >
                  {photo.url ? (
                    <>
                      <LazyImage src={photo.url} alt={photo.caption} className="w-full h-full" aspectRatio="1/1" />
                      <div className="absolute inset-0 bg-[#0F1A08]/0 group-hover:bg-[#0F1A08]/50 transition-all duration-300 flex items-center justify-center">
                        <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0F1A08]/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-xs font-medium leading-tight text-center">{photo.caption}</p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-[#1a2d0a] flex flex-col items-center justify-center gap-1 p-3">
                      <Image size={22} className="text-[#D4AF37]/25" />
                      <p className="text-[#D4AF37]/30 text-xs text-center leading-tight">{photo.caption}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-[#D4AF37]/10 flex-shrink-0">
          <p className="text-[#F5F0E8]/25 text-xs text-center">Click any photo to view full size</p>
        </div>
      </div>

      <style>{`
        @keyframes burstIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

// ─── Flip Card ───────────────────────────────────────────────────────────────
const DOUBLE_CLICK_MS = 300;

const FlipCard: React.FC<{
  photo: GalleryPhoto;
  categoryCount: number;
  onOpenLightbox: () => void;
  onBurst: () => void;
}> = ({ photo, categoryCount, onOpenLightbox, onBurst }) => {
  const [flipped, setFlipped] = useState(false);
  const cfg        = categoryConfig[photo.category] || categoryConfig.personal;
  const tapTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapCount   = useRef(0);
  const hasMultiple = categoryCount > 1;

  const handleClick = useCallback(() => {
    tapCount.current += 1;

    if (tapCount.current === 1) {
      // wait to see if a second tap comes
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
        // single tap logic
        if (!flipped) {
          setFlipped(true);
        }
        // single tap on back does nothing extra — double tap handles burst
      }, DOUBLE_CLICK_MS);
    } else if (tapCount.current === 2) {
      // double tap
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapCount.current = 0;
      if (flipped && hasMultiple) {
        onBurst();
      } else if (flipped && photo.url) {
        onOpenLightbox();
      } else {
        setFlipped(true);
      }
    }
  }, [flipped, hasMultiple, onBurst, onOpenLightbox, photo.url]);

  return (
    <div
      className="group aspect-square cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={handleClick}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-colors"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#1a3008] via-[#243d10] to-[#1a2d0a] flex flex-col items-center justify-center p-4 gap-2">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
              {cfg.bigIcon}
            </div>
            <p className="text-white/80 text-xs font-medium text-center leading-snug px-2">{photo.caption}</p>
            <span className="text-[#D4AF37]/50 text-xs">{photo.date}</span>
            {/* folder badge */}
            {hasMultiple && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mt-1">
                <FolderOpen size={10} className="text-[#D4AF37]/60" />
                <span className="text-[#D4AF37]/60 text-xs">{categoryCount} in folder</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[#D4AF37]/30 text-xs">
              <RotateCcw size={10} />
              <span>Tap to flip</span>
            </div>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border border-[#D4AF37]/30"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {photo.url ? (
            <div className="relative w-full h-full">
              <LazyImage src={photo.url} alt={photo.caption} className="w-full h-full" style={{ position: 'absolute', inset: 0 }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A08]/80 via-transparent to-transparent" />

              {/* hint overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {hasMultiple && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4AF37]/90 text-[#0F1A08] text-xs font-bold">
                    <FolderOpen size={12} />
                    Double-tap to open folder
                  </div>
                )}
                {!hasMultiple && photo.url && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold">
                    <ZoomIn size={12} />
                    Double-tap to enlarge
                  </div>
                )}
              </div>

              <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium leading-tight text-center drop-shadow">{photo.caption}</p>

              <button
                onClick={e => { e.stopPropagation(); setFlipped(false); }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#0F1A08]/70 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                title="Flip back"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="w-full h-full bg-[#1a3008] flex flex-col items-center justify-center gap-2 p-3">
              <Image size={28} className="text-[#D4AF37]/30" />
              <p className="text-[#D4AF37]/40 text-xs text-center">Photo coming soon</p>
              <button
                onClick={e => { e.stopPropagation(); setFlipped(false); }}
                className="mt-1 flex items-center gap-1 text-[#D4AF37]/40 hover:text-[#D4AF37] text-xs transition-colors"
              >
                <RotateCcw size={10} /> Flip back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Gallery Lightbox ────────────────────────────────────────────────────────
const Lightbox: React.FC<{
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}> = ({ photos, index, onClose, onPrev, onNext }) => (
  <div
    className="fixed inset-0 z-[60] bg-[#0F1A08]/95 backdrop-blur-md flex items-center justify-center"
    onClick={onClose}
  >
    <button className="absolute top-6 right-6 text-white/60 hover:text-white p-2" onClick={onClose}>
      <X size={28} />
    </button>
    <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-[#D4AF37] p-2"
      onClick={e => { e.stopPropagation(); onPrev(); }}>
      <ChevronLeft size={36} />
    </button>
    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-[#D4AF37] p-2"
      onClick={e => { e.stopPropagation(); onNext(); }}>
      <ChevronRight size={36} />
    </button>
    <div className="max-w-3xl max-h-[80vh] mx-auto px-16" onClick={e => e.stopPropagation()}>
      {photos[index]?.url ? (
        <img src={photos[index].url} alt={photos[index].caption}
          className="max-h-[70vh] w-auto mx-auto rounded-2xl" />
      ) : (
        <div className="w-64 h-64 bg-[#1a3008] rounded-2xl flex items-center justify-center mx-auto">
          <Image size={48} className="text-[#D4AF37]/30" />
        </div>
      )}
      <p className="text-white text-center mt-4 font-medium">{photos[index]?.caption}</p>
      <p className="text-[#D4AF37]/50 text-center text-sm">{photos[index]?.date}</p>
    </div>
  </div>
);

// ─── Main Gallery Section ────────────────────────────────────────────────────
export const GallerySection: React.FC = () => {
  const { data } = useSite();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxPhotos, setLightboxPhotos]  = useState<GalleryPhoto[]>([]);
  const [lightboxIndex,  setLightboxIndex]   = useState<number | null>(null);
  const [burstCategory,  setBurstCategory]   = useState<string | null>(null);

  const filtered = activeCategory === 'all'
    ? data.gallery
    : data.gallery.filter(p => p.category === activeCategory);

  const categories = ['all', ...Array.from(new Set(data.gallery.map(p => p.category)))];

  // count per category
  const countByCategory = data.gallery.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  // photos in the burst folder
  const burstPhotos = burstCategory
    ? data.gallery.filter(p => p.category === burstCategory)
    : [];

  const openLightboxFromMain = (photos: GalleryPhoto[], index: number) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
  };

  const openLightboxFromBurst = (index: number) => {
    setLightboxPhotos(burstPhotos);
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () => setLightboxIndex(i => i !== null ? (i - 1 + lightboxPhotos.length) % lightboxPhotos.length : null);
  const nextPhoto = () => setLightboxIndex(i => i !== null ? (i + 1) % lightboxPhotos.length : null);

  return (
    <section id="gallery" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1807] via-[#0F1A08] to-[#0d1807]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">Captured Moments</p>
          <h2 className="font-display text-5xl sm:text-6xl font-black text-white">
            The <span className="text-shimmer">Gallery</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-3">
            <p className="text-[#F5F0E8]/40 text-xs flex items-center gap-1.5">
              <RotateCcw size={12} /> Single tap to flip
            </p>
            <span className="hidden sm:block text-[#D4AF37]/20">·</span>
            <p className="text-[#F5F0E8]/40 text-xs flex items-center gap-1.5">
              <FolderOpen size={12} className="text-[#D4AF37]/40" />
              Double-tap the photo to open the full folder
            </p>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map(cat => {
            const cfg = categoryConfig[cat] || { icon: <LayoutGrid size={13} />, bigIcon: null, label: cat };
            const count = cat === 'all' ? data.gallery.length : (countByCategory[cat] || 0);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-[#D4AF37] text-[#0F1A08] font-bold'
                    : 'border border-[#D4AF37]/20 text-[#F5F0E8]/60 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]'
                }`}
              >
                {cfg.icon}
                {cfg.label}
                <span className={`text-xs rounded-full px-1.5 py-0.5 ml-0.5 ${
                  activeCategory === cat ? 'bg-[#0F1A08]/20' : 'bg-[#D4AF37]/10 text-[#D4AF37]/50'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((photo, i) => (
              <FlipCard
                key={photo.id}
                photo={photo}
                categoryCount={countByCategory[photo.category] || 1}
                onOpenLightbox={() => openLightboxFromMain(filtered, i)}
                onBurst={() => setBurstCategory(photo.category)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Image size={48} className="text-[#D4AF37]/20 mx-auto mb-4" />
            <p className="text-[#F5F0E8]/40">No photos in this category yet</p>
          </div>
        )}
      </div>

      {/* Folder burst overlay */}
      {burstCategory && (
        <FolderBurst
          category={burstCategory}
          photos={burstPhotos}
          onClose={() => setBurstCategory(null)}
          onOpenPhoto={openLightboxFromBurst}
        />
      )}

      {/* Lightbox — above burst overlay */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={lightboxPhotos}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </section>
  );
};
