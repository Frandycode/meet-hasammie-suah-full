/**
 * usePageView — fires a tracking event on every route change.
 *
 * How it works:
 *  1. On mount, it records the current page and start time.
 *  2. When the component unmounts (i.e. the user navigates away),
 *     it sends a POST /track with the page path + how long they stayed.
 *  3. A random sessionId is created once per browser session (sessionStorage)
 *     so we can count unique visitors without storing personal data.
 */
import { useEffect, useRef } from 'react';
import { useLocation }       from 'react-router-dom';
import posthog               from 'posthog-js';

const API_URL    = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const TRACK_URL  = `${API_URL}/track`;

// One random ID per browser tab session — resets when the tab is closed.
function getSessionId(): string {
  const key = 'hss_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function usePageView() {
  const location  = useLocation();
  const startRef  = useRef<number>(Date.now());
  const sessionId = getSessionId();

  useEffect(() => {
    // Record the moment we arrived on this page.
    startRef.current = Date.now();
    const page     = location.pathname;
    const referrer = document.referrer || undefined;
    const userAgent = navigator.userAgent;

    // Also tell Posthog about this pageview (safe no-op if key not set)
    posthog.capture('$pageview', { $current_url: window.location.href });

    // When the user leaves (navigate away or close tab), send the duration.
    // We use a cleanup function so it fires when the component unmounts,
    // which in React Router happens on every route change.
    return () => {
      const durationSec = Math.round((Date.now() - startRef.current) / 1000);

      // navigator.sendBeacon is the safest way to send data while navigating —
      // it continues even if the page is being unloaded.
      const payload = JSON.stringify({ page, referrer, userAgent, sessionId, durationSec });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(TRACK_URL, new Blob([payload], { type: 'application/json' }));
      } else {
        // Fallback for older browsers
        fetch(TRACK_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    payload,
          keepalive: true,   // keeps the request alive past page unload
        }).catch(() => {});  // silently ignore errors — tracking is non-critical
      }
    };
  }, [location.pathname]); // re-run every time the URL path changes
}
