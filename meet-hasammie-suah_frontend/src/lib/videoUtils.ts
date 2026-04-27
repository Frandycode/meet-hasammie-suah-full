/**
 * videoUtils.ts — parses YouTube and Vimeo URLs into embed URLs and thumbnails.
 *
 * Why hand-roll this?
 * Both platforms have several valid URL formats (short links, full URLs,
 * mobile URLs, playlist links). This utility normalises all of them so
 * the admin can paste any format and it just works.
 *
 * Supports:
 *   YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 *            youtube.com/shorts/ID, youtube.com/live/ID
 *   Vimeo:   vimeo.com/ID, player.vimeo.com/video/ID
 */

export type VideoProvider = 'youtube' | 'vimeo' | 'unknown';

export interface ParsedVideo {
  provider:  VideoProvider;
  id:        string | null;
  embedUrl:  string;
  thumbnail: string | null;  // auto-extracted where possible
  valid:     boolean;
}

// ── YouTube ───────────────────────────────────────────────────────────────────
function parseYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,           // watch?v=
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,       // youtu.be/
    /embed\/([a-zA-Z0-9_-]{11})/,           // embed/
    /shorts\/([a-zA-Z0-9_-]{11})/,          // shorts/
    /live\/([a-zA-Z0-9_-]{11})/,            // live/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ── Vimeo ─────────────────────────────────────────────────────────────────────
function parseVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

// ── Main export ───────────────────────────────────────────────────────────────
export function parseVideoUrl(url: string): ParsedVideo {
  const trimmed = url.trim();

  // YouTube
  if (/youtube\.com|youtu\.be/i.test(trimmed)) {
    const id = parseYouTubeId(trimmed);
    if (id) {
      return {
        provider:  'youtube',
        id,
        // Use privacy-enhanced embed domain — doesn't set cookies until play
        embedUrl:  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
        // hqdefault is 480×360 — always available. maxresdefault is 1280×720 but
        // may 404 for older or low-view videos, so we use hqdefault as the safe pick.
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        valid:     true,
      };
    }
  }

  // Vimeo
  if (/vimeo\.com/i.test(trimmed)) {
    const id = parseVimeoId(trimmed);
    if (id) {
      return {
        provider:  'vimeo',
        id,
        embedUrl:  `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`,
        // Vimeo thumbnails require an API call — we return null and let
        // the admin paste a custom thumbnail URL if they want one.
        thumbnail: null,
        valid:     true,
      };
    }
  }

  return {
    provider:  'unknown',
    id:        null,
    embedUrl:  trimmed,
    thumbnail: null,
    valid:     false,
  };
}

// Category display config
export const videoCategoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  RACE:      { label: 'Race',      color: 'text-[#D4AF37]',    bg: 'bg-[#D4AF37]/15' },
  TRAINING:  { label: 'Training',  color: 'text-green-400',    bg: 'bg-green-400/10' },
  INTERVIEW: { label: 'Interview', color: 'text-blue-400',     bg: 'bg-blue-400/10'  },
  OTHER:     { label: 'Other',     color: 'text-[#F5F0E8]/50', bg: 'bg-white/5'      },
};
