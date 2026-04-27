/**
 * Zod validation schemas for all incoming API data.
 *
 * Why Zod?
 * TypeScript only checks types at *compile time* — it can't protect you from
 * bad data sent by a real HTTP client at runtime. Zod lets you define a schema
 * once and get both runtime validation AND TypeScript types from it.
 *
 * Pattern:
 *   1. Define a schema with z.object({...})
 *   2. Call schema.parse(data) — throws a ZodError with clear messages if invalid
 *   3. Use z.infer<typeof schema> to get the TypeScript type for free
 */
import { z } from 'zod';

// ── /track endpoint ───────────────────────────────────────────────────────────
export const trackSchema = z.object({
  page:        z.string().min(1).max(500),
  sessionId:   z.string().min(1).max(100),
  referrer:    z.string().max(500).optional(),
  userAgent:   z.string().max(500).optional(),
  durationSec: z.number().int().min(0).max(86_400).optional(), // max 24hrs
});

export type TrackInput = z.infer<typeof trackSchema>;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  password: z.string().min(1).max(200),
});

// ── Site content ──────────────────────────────────────────────────────────────
export const heroInputSchema = z.object({
  tagline:  z.string().max(200).optional(),
  subtitle: z.string().max(200).optional(),
  quote:    z.string().max(500).optional(),
});

export const bioInputSchema = z.object({
  intro:     z.string().max(2000).optional(),
  story:     z.string().max(5000).optional(),
  coachNote: z.string().max(2000).optional(),
  coachName: z.string().max(200).optional(),
});

// ── Stats & achievements ──────────────────────────────────────────────────────
export const statInputSchema = z.object({
  label: z.string().min(1).max(100),
  value: z.string().min(1).max(50),
  unit:  z.string().max(20).optional(),
  order: z.number().int().optional(),
});

export const achievementInputSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  date:        z.string().min(1).max(50),
  medal:       z.enum(['GOLD', 'SILVER', 'BRONZE']),
  order:       z.number().int().optional(),
});

// ── Events ────────────────────────────────────────────────────────────────────
export const eventInputSchema = z.object({
  title:    z.string().min(1).max(200),
  date:     z.string().min(1),
  location: z.string().min(1).max(300),
  type:     z.enum(['MEET', 'CHAMPIONSHIP', 'TRAINING', 'OTHER']),
  order:    z.number().int().optional(),
});

// ── Contact form ──────────────────────────────────────────────────────────────
export const contactFormSchema = z.object({
  name:    z.string().min(1, 'Name is required').max(100),
  email:   z.string().email('Please enter a valid email').max(200),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ── Helper — formats ZodError messages into a clean string ───────────────────
import { ZodError } from 'zod';

export function formatZodError(err: ZodError): string {
  return err.errors
    .map(e => `${e.path.join('.')}: ${e.message}`)
    .join(', ');
}
