/**
 * PressKitPage — public-facing press kit at /press-kit
 *
 * Designed for media, scouts, and sponsors. Shows:
 *  - A headline press bio (managed from admin)
 *  - Quick facts pulled from existing site data
 *  - Key stats and achievements
 *  - Downloadable photos and documents
 *  - Contact details
 */
import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import {
  Download, FileText, Image as ImageIcon, Mail,
  ArrowLeft, ExternalLink, Calendar, MapPin, School,
  Trophy, Zap, Copy, Check,
} from 'lucide-react';
import { GET_PRESS_KIT } from '../lib/queries';
import { useSite } from '../context/SiteContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { LazyImage } from '../components/LazyImage';
import { ErrorBoundary } from '../components/ErrorBoundary';

// ── Types ─────────────────────────────────────────────────────────────────────
interface PressKitAsset {
  id: string; label: string; type: 'PHOTO' | 'DOCUMENT';
  url: string | null; fileSize: number | null; mimeType: string | null; order: number;
}
interface PressKitMeta {
  id: string; pressBio: string; contactName: string; contactEmail: string;
}
interface PressKitData {
  pressKit: { meta: PressKitMeta; assets: PressKitAsset[]; };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Copy-to-clipboard button ──────────────────────────────────────────────────
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className="ml-2 p-1.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-all"
      title="Copy to clipboard">
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
};

// ── Asset card ────────────────────────────────────────────────────────────────
const AssetCard: React.FC<{ asset: PressKitAsset }> = ({ asset }) => {
  const isPhoto = asset.type === 'PHOTO';
  return (
    <div className="group bg-[#0F1A08] border border-[#D4AF37]/15 rounded-2xl overflow-hidden hover:border-[#D4AF37]/40 transition-all duration-300">
      {/* Thumbnail or icon */}
      {isPhoto && asset.url ? (
        <div className="aspect-[4/3] overflow-hidden">
          <LazyImage
            src={asset.url} alt={asset.label}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
            aspectRatio="4/3"
          />
        </div>
      ) : (
        <div className="aspect-[4/3] flex items-center justify-center bg-[#1a2d0a]/40">
          <FileText size={40} className="text-[#D4AF37]/30" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${
              isPhoto
                ? 'bg-[#D4AF37]/10 text-[#D4AF37]/80'
                : 'bg-blue-500/10 text-blue-400/80'
            }`}>
              {isPhoto ? <ImageIcon size={10} /> : <FileText size={10} />}
              {isPhoto ? 'Photo' : 'Document'}
            </span>
            <p className="text-white text-sm font-medium leading-tight">{asset.label}</p>
            {asset.fileSize && (
              <p className="text-[#F5F0E8]/30 text-xs mt-0.5">{formatBytes(asset.fileSize)}</p>
            )}
          </div>
        </div>

        {asset.url && (
          <a
            href={asset.url}
            download
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl
              bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40
              text-[#D4AF37] text-xs font-semibold transition-all duration-200"
          >
            <Download size={13} />
            Download
          </a>
        )}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const PressKitPage: React.FC = () => {
  const { data: siteData } = useSite();
  const { data, loading } = useQuery<PressKitData>(GET_PRESS_KIT);

  const meta   = data?.pressKit.meta;
  const assets = data?.pressKit.assets ?? [];
  const photos = assets.filter(a => a.type === 'PHOTO');
  const docs   = assets.filter(a => a.type === 'DOCUMENT');

  return (
    <div className="min-h-screen bg-[#0F1A08]">
      <Navbar />

      <main className="pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-6">

          {/* ── Back link ── */}
          <Link to="/"
            className="inline-flex items-center gap-2 text-[#D4AF37]/50 hover:text-[#D4AF37] text-sm mb-10 transition-colors">
            <ArrowLeft size={14} />
            Back to site
          </Link>

          {/* ── Header ── */}
          <div className="mb-14">
            <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">
              For media · scouts · sponsors
            </p>
            <h1 className="text-white font-black text-5xl sm:text-6xl mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}>
              Press Kit
            </h1>
            <p className="text-[#F5F0E8]/50 text-base max-w-xl">
              Official downloadable assets and biography for HaSammie Suah.
              All materials are cleared for editorial use with attribution.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">

            {/* ── Left column: bio + quick facts ── */}
            <div className="lg:col-span-1 space-y-6">

              {/* Profile photo */}
              {siteData.profilePhoto && (
                <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/20 aspect-[3/4]">
                  <LazyImage
                    src={siteData.profilePhoto}
                    alt="HaSammie Suah — Official profile photo"
                    className="w-full h-full"
                    aspectRatio="3/4"
                  />
                </div>
              )}

              {/* Quick facts */}
              <div className="bg-[#0F1A08] border border-[#D4AF37]/15 rounded-2xl p-5 space-y-3">
                <h3 className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase">Quick facts</h3>
                {[
                  { icon: <Calendar size={13} />, label: 'Born', value: 'August 5, 2009' },
                  { icon: <MapPin size={13} />,   label: 'Hometown', value: 'Tulsa, Oklahoma' },
                  { icon: <School size={13} />,   label: 'School', value: 'Union High School' },
                  { icon: <Zap size={13} />,      label: 'Rank', value: 'Top 5 — State of Oklahoma' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="text-[#D4AF37]/40 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-[#F5F0E8]/40 text-xs">{item.label}</p>
                      <p className="text-white text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key stats */}
              {siteData.stats.length > 0 && (
                <div className="bg-[#0F1A08] border border-[#D4AF37]/15 rounded-2xl p-5">
                  <h3 className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase mb-3">Key stats</h3>
                  <div className="space-y-2">
                    {siteData.stats.slice(0, 5).map(stat => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <span className="text-[#F5F0E8]/50 text-sm">{stat.label}</span>
                        <span className="text-[#D4AF37] font-bold text-sm">
                          {stat.value}{stat.unit ? ` ${stat.unit}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              {meta && (
                <div className="bg-[#0F1A08] border border-[#D4AF37]/15 rounded-2xl p-5 space-y-3">
                  <h3 className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase">Media contact</h3>
                  <div>
                    <p className="text-white text-sm font-medium">{meta.contactName}</p>
                    {meta.contactEmail && (
                      <div className="flex items-center mt-1">
                        <a href={`mailto:${meta.contactEmail}`}
                          className="text-[#D4AF37]/70 hover:text-[#D4AF37] text-sm flex items-center gap-1 transition-colors">
                          <Mail size={12} />
                          {meta.contactEmail}
                        </a>
                        <CopyButton text={meta.contactEmail} />
                      </div>
                    )}
                  </div>
                  <a href="#contact"
                    className="flex items-center gap-2 text-xs text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors">
                    <ExternalLink size={11} />
                    Use the contact form
                  </a>
                </div>
              )}
            </div>

            {/* ── Right column: bio + assets ── */}
            <div className="lg:col-span-2 space-y-10">

              {/* Press bio */}
              <div>
                <h2 className="text-white text-2xl font-bold mb-4"
                  style={{ fontFamily: 'Playfair Display, serif' }}>
                  Official biography
                </h2>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 bg-[#D4AF37]/5 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-[#F5F0E8]/75 text-base leading-relaxed whitespace-pre-wrap">
                      {meta?.pressBio ?? siteData.bio.intro}
                    </p>
                  </div>
                )}
              </div>

              {/* Top achievements */}
              {siteData.achievements.length > 0 && (
                <div>
                  <h2 className="text-white text-2xl font-bold mb-4"
                    style={{ fontFamily: 'Playfair Display, serif' }}>
                    Notable achievements
                  </h2>
                  <div className="space-y-3">
                    {siteData.achievements.slice(0, 4).map(a => (
                      <div key={a.id}
                        className="flex items-start gap-3 p-4 rounded-xl bg-[#0F1A08] border border-[#D4AF37]/10">
                        <Trophy size={16} className={
                          a.medal === 'gold' ? 'text-[#D4AF37] mt-0.5' :
                          a.medal === 'silver' ? 'text-gray-300 mt-0.5' : 'text-amber-700 mt-0.5'
                        } />
                        <div>
                          <p className="text-white text-sm font-semibold">{a.title}</p>
                          <p className="text-[#F5F0E8]/40 text-xs mt-0.5">{a.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Downloadable photos */}
              {photos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white text-2xl font-bold"
                      style={{ fontFamily: 'Playfair Display, serif' }}>
                      Press photos
                    </h2>
                    <span className="text-[#F5F0E8]/30 text-xs">{photos.length} available</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {photos.map(asset => <AssetCard key={asset.id} asset={asset} />)}
                  </div>
                </div>
              )}

              {/* Downloadable documents */}
              {docs.length > 0 && (
                <div>
                  <h2 className="text-white text-2xl font-bold mb-4"
                    style={{ fontFamily: 'Playfair Display, serif' }}>
                    Documents
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {docs.map(asset => <AssetCard key={asset.id} asset={asset} />)}
                  </div>
                </div>
              )}

              {/* Empty state — no assets yet */}
              {!loading && assets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-[#D4AF37]/10 rounded-2xl">
                  <Download size={32} className="text-[#D4AF37]/20 mb-3" />
                  <p className="text-[#F5F0E8]/30 text-sm">Downloadable assets coming soon.</p>
                  <p className="text-[#F5F0E8]/20 text-xs mt-1">
                    Contact us directly for high-resolution photos.
                  </p>
                </div>
              )}

              {/* Usage note */}
              <p className="text-[#F5F0E8]/25 text-xs border-t border-[#D4AF37]/10 pt-6">
                All photos and materials are provided for editorial use only.
                Please credit "HaSammie Suah / meethasammiesuah.com" when publishing.
              </p>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
