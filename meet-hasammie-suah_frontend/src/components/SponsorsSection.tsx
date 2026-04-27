/**
 * SponsorsSection — public-facing sponsors wall on the homepage.
 *
 * Three visual tiers:
 *  GOLD       — featured cards with logo, name, and description
 *  SILVER     — clean logo cards with name
 *  COMMUNITY  — compact pill row, just name (or logo if available)
 *
 * Gracefully renders nothing if there are no active sponsors yet.
 */
import React from 'react';
import { useQuery } from '@apollo/client/react';
import { ExternalLink, Star } from 'lucide-react';
import { GET_SPONSORS } from '../lib/queries';
import { LazyImage } from './LazyImage';

interface Sponsor {
  id: string;
  name: string;
  tier: 'GOLD' | 'SILVER' | 'COMMUNITY';
  logoUrl: string | null;
  website: string | null;
  description: string | null;
  order: number;
}

// ── Gold sponsor card ─────────────────────────────────────────────────────────
const GoldCard: React.FC<{ sponsor: Sponsor }> = ({ sponsor }) => {
  const inner = (
    <div className="group relative bg-[#0F1A08] border border-[#D4AF37]/30 hover:border-[#D4AF37]/70 rounded-2xl p-8 transition-all duration-300 hover:bg-[#1a2d0a]/60 flex flex-col items-center text-center gap-5">
      {/* Gold tier badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/25">
        <Star size={9} className="text-[#D4AF37] fill-[#D4AF37]" />
        <span className="text-[#D4AF37] text-[10px] font-bold tracking-wider uppercase">Gold</span>
      </div>

      {/* Logo */}
      {sponsor.logoUrl ? (
        <div className="w-32 h-20 flex items-center justify-center">
          <LazyImage
            src={sponsor.logoUrl}
            alt={`${sponsor.name} logo`}
            className="max-w-full max-h-full object-contain"
            style={{ aspectRatio: 'auto' }}
          />
        </div>
      ) : (
        <div className="w-32 h-20 flex items-center justify-center rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
          <span className="text-[#D4AF37] font-bold text-lg leading-tight px-3 text-center">{sponsor.name}</span>
        </div>
      )}

      {/* Name */}
      <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
        {sponsor.name}
      </h3>

      {/* Description */}
      {sponsor.description && (
        <p className="text-[#F5F0E8]/50 text-sm leading-relaxed max-w-xs">
          {sponsor.description}
        </p>
      )}

      {/* Visit link */}
      {sponsor.website && (
        <div className="flex items-center gap-1 text-[#D4AF37]/50 group-hover:text-[#D4AF37] text-xs transition-colors mt-auto">
          <ExternalLink size={11} />
          <span>Visit website</span>
        </div>
      )}
    </div>
  );

  return sponsor.website ? (
    <a href={sponsor.website} target="_blank" rel="noreferrer" className="block">
      {inner}
    </a>
  ) : <div>{inner}</div>;
};

// ── Silver sponsor card ───────────────────────────────────────────────────────
const SilverCard: React.FC<{ sponsor: Sponsor }> = ({ sponsor }) => {
  const inner = (
    <div className="group bg-[#0F1A08] border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center gap-4">
      {sponsor.logoUrl ? (
        <div className="w-24 h-14 flex items-center justify-center">
          <LazyImage
            src={sponsor.logoUrl}
            alt={`${sponsor.name} logo`}
            className="max-w-full max-h-full object-contain"
            style={{ aspectRatio: 'auto' }}
          />
        </div>
      ) : (
        <div className="w-24 h-14 flex items-center justify-center rounded-xl bg-[#D4AF37]/8 border border-[#D4AF37]/15">
          <span className="text-[#D4AF37]/70 font-semibold text-sm text-center px-2">{sponsor.name}</span>
        </div>
      )}
      <p className="text-[#F5F0E8]/60 text-sm font-medium text-center">{sponsor.name}</p>
    </div>
  );

  return sponsor.website ? (
    <a href={sponsor.website} target="_blank" rel="noreferrer" className="block">
      {inner}
    </a>
  ) : <div>{inner}</div>;
};

// ── Community sponsor pill ────────────────────────────────────────────────────
const CommunityPill: React.FC<{ sponsor: Sponsor }> = ({ sponsor }) => {
  const inner = (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F1A08] border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 transition-all duration-200 group">
      {sponsor.logoUrl && (
        <img
          src={sponsor.logoUrl}
          alt={sponsor.name}
          className="w-5 h-5 object-contain rounded"
          loading="lazy"
        />
      )}
      <span className="text-[#F5F0E8]/50 group-hover:text-[#F5F0E8]/80 text-sm transition-colors">
        {sponsor.name}
      </span>
    </div>
  );

  return sponsor.website ? (
    <a href={sponsor.website} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : <div>{inner}</div>;
};

// ── Main section ──────────────────────────────────────────────────────────────
export const SponsorsSection: React.FC = () => {
  const { data, loading } = useQuery<{ sponsors: Sponsor[] }>(GET_SPONSORS);
  const sponsors = data?.sponsors ?? [];

  const gold      = sponsors.filter(s => s.tier === 'GOLD');
  const silver    = sponsors.filter(s => s.tier === 'SILVER');
  const community = sponsors.filter(s => s.tier === 'COMMUNITY');

  // Don't render the section at all while loading or if there are no sponsors
  if (loading || sponsors.length === 0) return null;

  return (
    <section id="sponsors" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a1005]" />
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#D4AF37]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">
            Those Who Believe
          </p>
          <h2 className="font-display text-5xl sm:text-6xl font-black text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}>
            Our <span style={{
              backgroundImage: 'linear-gradient(135deg, #D4AF37 0%, #9AB800 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Sponsors</span>
          </h2>
          <p className="text-[#F5F0E8]/40 text-base mt-4 max-w-md mx-auto">
            These individuals and organizations are investing in HaSammie's journey to the top.
          </p>
        </div>

        {/* Gold tier */}
        {gold.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <div className="h-px flex-1 bg-[#D4AF37]/10 max-w-[80px]" />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <Star size={11} className="text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">Gold Sponsors</span>
              </div>
              <div className="h-px flex-1 bg-[#D4AF37]/10 max-w-[80px]" />
            </div>
            <div className={`grid gap-6 ${
              gold.length === 1 ? 'max-w-sm mx-auto' :
              gold.length === 2 ? 'sm:grid-cols-2 max-w-2xl mx-auto' :
              'sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {gold.map(s => <GoldCard key={s.id} sponsor={s} />)}
            </div>
          </div>
        )}

        {/* Silver tier */}
        {silver.length > 0 && (
          <div className="mb-14">
            {gold.length > 0 && (
              <div className="flex items-center gap-3 mb-6 justify-center">
                <div className="h-px flex-1 bg-[#D4AF37]/8 max-w-[80px]" />
                <span className="text-[#F5F0E8]/30 text-xs font-semibold tracking-widest uppercase">Silver Sponsors</span>
                <div className="h-px flex-1 bg-[#D4AF37]/8 max-w-[80px]" />
              </div>
            )}
            <div className={`grid gap-4 ${
              silver.length <= 2 ? 'sm:grid-cols-2 max-w-lg mx-auto' :
              silver.length <= 4 ? 'grid-cols-2 sm:grid-cols-4 max-w-3xl mx-auto' :
              'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            }`}>
              {silver.map(s => <SilverCard key={s.id} sponsor={s} />)}
            </div>
          </div>
        )}

        {/* Community tier */}
        {community.length > 0 && (
          <div>
            {(gold.length > 0 || silver.length > 0) && (
              <div className="flex items-center gap-3 mb-6 justify-center">
                <div className="h-px flex-1 bg-[#D4AF37]/5 max-w-[80px]" />
                <span className="text-[#F5F0E8]/25 text-xs font-semibold tracking-widest uppercase">Community</span>
                <div className="h-px flex-1 bg-[#D4AF37]/5 max-w-[80px]" />
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center">
              {community.map(s => <CommunityPill key={s.id} sponsor={s} />)}
            </div>
          </div>
        )}

        {/* CTA to become a sponsor */}
        <div className="mt-16 text-center">
          <p className="text-[#F5F0E8]/30 text-sm mb-4">
            Interested in supporting HaSammie's journey?
          </p>
          <a
            href="#contact"
            onClick={e => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/10 transition-all duration-300"
          >
            <Star size={14} className="fill-[#D4AF37]" />
            Become a sponsor
          </a>
        </div>

      </div>
    </section>
  );
};
