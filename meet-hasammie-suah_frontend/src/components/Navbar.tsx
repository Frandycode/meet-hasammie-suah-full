import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home',         href: '#hero' },
  { label: 'About',        href: '#about' },
  { label: 'Stats',        href: '#stats' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Gallery',      href: '#gallery' },
  { label: 'Videos',       href: '#videos' },
  { label: 'Events',       href: '#events' },
  { label: 'Support',      href: '#donate' },
  { label: 'Contact',      href: '#contact' },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Smart scroll: works from any page by navigating home first if needed
  const scrollTo = (href: string) => {
    setMenuOpen(false);
    if (window.location.pathname !== '/') {
      window.location.href = '/' + href;
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-[#0F1A08]/95 backdrop-blur-md border-b border-[#D4AF37]/20 shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => scrollTo('#hero')} className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#7A9B00] flex items-center justify-center text-[#0F1A08] font-bold text-lg" style={{fontFamily:'Playfair Display,serif'}}>
            S
          </div>
          <div className="hidden sm:block">
            <div className="text-[#D4AF37] font-semibold text-xs tracking-widest uppercase" style={{fontFamily:'DM Sans,sans-serif'}}>
              Meet
            </div>
            <div className="text-white font-bold text-base leading-tight -mt-0.5" style={{fontFamily:'Playfair Display,serif'}}>
              HaSammie Suah
            </div>
          </div>
        </button>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-6">
          {navLinks.map(link => (
            <li key={link.label}>
              <button
                onClick={() => scrollTo(link.href)}
                className="text-[#F5F0E8]/70 hover:text-[#D4AF37] text-sm tracking-wide transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
              </button>
            </li>
          ))}
          <li>
            <Link
              to="/press-kit"
              className="text-[#D4AF37]/70 hover:text-[#D4AF37] text-sm border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 px-3 py-1 rounded-full transition-all duration-200"
            >
              Press Kit
            </Link>
          </li>
        </ul>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={() => scrollTo('#contact')}
            className="px-5 py-2 rounded-full text-sm font-medium border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F1A08] transition-all duration-300"
          >
            Connect
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-[#D4AF37] p-2"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0F1A08]/98 backdrop-blur-md border-t border-[#D4AF37]/20 px-6 py-6">
          <ul className="flex flex-col gap-2">
            {navLinks.map(link => (
              <li key={link.label}>
                <button
                  onClick={() => scrollTo(link.href)}
                  className="text-[#F5F0E8]/80 hover:text-[#D4AF37] text-base w-full text-left py-2.5 border-b border-[#D4AF37]/10 transition-colors"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <Link
                to="/press-kit"
                onClick={() => setMenuOpen(false)}
                className="block text-[#D4AF37]/80 hover:text-[#D4AF37] text-base py-2.5 border-b border-[#D4AF37]/10 transition-colors"
              >
                Press Kit
              </Link>
            </li>
            <li className="pt-2">
              <button
                onClick={() => scrollTo('#contact')}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold text-sm"
              >
                Connect with Sammie
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};
