/**
 * LazyImage — a drop-in replacement for <img> with two enhancements:
 *
 * 1. Lazy loading — the browser only downloads the image when it's near
 *    the viewport (using the native `loading="lazy"` attribute + IntersectionObserver
 *    for the fade-in effect). This saves bandwidth and speeds up initial page load.
 *
 * 2. Blur-up placeholder — while the real image loads, a tiny blurred version
 *    (or a solid colour) fills the space so there's no jarring layout shift.
 *    Once the image finishes loading, we fade it in smoothly.
 *
 * Usage:
 *   <LazyImage src="/uploads/photo.jpg" alt="Race day" />
 *   <LazyImage src={photo.url} alt={photo.caption} aspectRatio="4/3" />
 *
 * Why not use a library?
 * The native browser APIs are now good enough for this pattern without
 * adding any extra bytes to the bundle. Good thing to understand hands-on.
 */
import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src:          string;
  alt:          string;
  aspectRatio?: string;       // e.g. "4/3", "1/1", "16/9"
  placeholderColor?: string;  // fallback bg while loading
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  aspectRatio,
  placeholderColor = '#1a2d0a',
  className = '',
  style,
  ...rest
}) => {
  const [loaded,  setLoaded]  = useState(false);
  const [visible, setVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // IntersectionObserver — fires when the image enters the viewport
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // only need to fire once
        }
      },
      { rootMargin: '200px' } // start loading 200px before it enters view
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        position:    'relative',
        overflow:    'hidden',
        background:  placeholderColor,
        aspectRatio: aspectRatio,
        ...style,
      }}
      className={className}
    >
      {/* Shimmer animation while loading */}
      {!loaded && (
        <div
          style={{
            position:   'absolute',
            inset:      0,
            background: `linear-gradient(90deg, ${placeholderColor} 25%, #2a3d1a 50%, ${placeholderColor} 75%)`,
            backgroundSize: '200% 100%',
            animation:  'shimmer 1.4s infinite',
          }}
        />
      )}

      <img
        ref={imgRef}
        // Only set src once the element is visible — this is the lazy part
        src={visible ? src : undefined}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        style={{
          width:      '100%',
          height:     '100%',
          objectFit:  'cover',
          display:    'block',
          // Fade in smoothly once loaded
          opacity:    loaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
        {...rest}
      />

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};
