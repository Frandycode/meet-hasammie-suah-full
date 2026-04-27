/**
 * Simple in-memory rate limiter.
 *
 * Why not use a library like express-rate-limit?
 * This is intentionally hand-rolled so you can see exactly how rate limiting
 * works under the hood — it's a great learning exercise.
 *
 * How it works:
 *  - We keep a Map of { ip → { count, windowStart } }
 *  - On each request we check if the window has expired and reset it, or
 *    increment the count and block if it exceeds the limit.
 *  - A cleanup timer runs every minute to remove stale entries.
 *
 * For production at scale you'd replace this with Redis-backed rate limiting
 * (e.g. the `ioredis` + `rate-limiter-flexible` combo), but for a personal
 * site this is perfectly sufficient.
 */
import type { Request, Response, NextFunction } from 'express';

interface Window {
  count:       number;
  windowStart: number;
}

const windows = new Map<string, Window>();

// Clean up old entries every 60 seconds to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, win] of windows.entries()) {
    if (now - win.windowStart > 60_000) windows.delete(ip);
  }
}, 60_000);

/**
 * Creates a rate-limit middleware.
 * @param maxRequests  Max requests allowed per window
 * @param windowMs     Window duration in milliseconds
 */
export function createRateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Use the real client IP; the X-Forwarded-For header is set by nginx in Docker
    const ip  = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim()
             ?? req.socket.remoteAddress
             ?? 'unknown';

    const now = Date.now();
    const win = windows.get(ip);

    if (!win || now - win.windowStart > windowMs) {
      // Start a fresh window for this IP
      windows.set(ip, { count: 1, windowStart: now });
      next();
      return;
    }

    win.count++;

    if (win.count > maxRequests) {
      const retryAfter = Math.ceil((win.windowStart + windowMs - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({
        error: 'Too many requests — please slow down.',
        retryAfterSeconds: retryAfter,
      });
      return;
    }

    next();
  };
}

// Pre-configured limiters for different routes:

/** Tracking endpoint — generous limit, just prevents floods */
export const trackingLimiter = createRateLimit(
  60,      // 60 requests
  60_000,  // per minute
);

/** GraphQL endpoint — tighter for mutations, looser for queries */
export const graphqlLimiter = createRateLimit(
  120,     // 120 requests
  60_000,  // per minute
);

/** Auth endpoint — very tight to prevent brute force */
export const authLimiter = createRateLimit(
  10,      // 10 attempts
  60_000,  // per minute
);
