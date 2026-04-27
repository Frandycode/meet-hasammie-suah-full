import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Heart } from 'lucide-react';

const footerLinks = [
  { label: 'About',        href: '#about' },
  { label: 'Stats',        href: '#stats' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Gallery',      href: '#gallery' },
  { label: 'Videos',       href: '#videos' },
  { label: 'Events',       href: '#events' },
  { label: 'Support',      href: '#donate' },
  { label: 'Contact',      href: '#contact' },
];

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const scrollTo = (href: string) => {
    if (window.location.pathname !== '/') {
      window.location.href = '/' + href;
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#0a1005] border-t border-[#D4AF37]/10 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top row */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 mb-10">

          {/* Brand */}
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-3">
              <div
                className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#7A9B00] flex items-center justify-center text-[#0F1A08] font-black text-xl"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >S</div>
              <div>
                <div className="font-display text-xl font-bold text-white leading-tight">Meet HaSammie Suah</div>
                <div className="text-[#D4AF37]/50 text-xs">Track · Union High School · Tulsa, OK</div>
              </div>
            </div>
            <p className="font-accent italic text-[#D4AF37]/60 text-sm max-w-xs">
              "Every stride is a story."
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-[#D4AF37]/40 text-xs uppercase tracking-widest mb-3 text-center lg:text-left">Explore</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start max-w-sm">
              {footerLinks.map(link => (
                <button key={link.label} onClick={() => scrollTo(link.href)}
                  className="text-[#F5F0E8]/40 hover:text-[#D4AF37] text-sm transition-colors duration-200">
                  {link.label}
                </button>
              ))}
              <Link to="/press-kit"
                className="text-[#D4AF37]/50 hover:text-[#D4AF37] text-sm transition-colors duration-200">
                Press Kit
              </Link>
            </div>
          </div>

          {/* Support CTA */}
          <div className="text-center">
            <p className="text-[#D4AF37]/40 text-xs uppercase tracking-widest mb-3">Cheer Her On</p>
            <button
              onClick={() => scrollTo('#donate')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#7A9B00]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/30 transition-all duration-300 mx-auto"
            >
              <Heart size={14} fill="currentColor" />
              Support Sammie
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#D4AF37]/10 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[#D4AF37]/30 text-xs">
              <Zap size={10} />
              <span>Top 5 Oklahoma {year}</span>
            </div>
            <p className="text-[#F5F0E8]/25 text-xs text-center">
              © {year} HaSammie Suah. All rights reserved.
            </p>
            <div className="text-xs text-[#F5F0E8]/25">
              Built with love by{' '}
              <a href="https://github.com/frandycode" target="_blank" rel="noreferrer"
                className="text-[#b91c1c] hover:opacity-80 transition-opacity font-semibold">
                Frandy Slueue
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
