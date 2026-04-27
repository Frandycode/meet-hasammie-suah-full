import React from 'react';
import { ChevronDown, Star, Zap } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useTypingEffect } from '../hooks/useTypingEffect';
import { RunningPerson } from './RunningPerson';

export const HeroSection: React.FC = () => {
  const { data } = useSite();

  const { displayed, isDeleting } = useTypingEffect({
    text: 'HaSammie',
    typeSpeed: 500,
    deleteSpeed: 65,
    pauseAfterType: 5000,
    pauseAfterDelete: 500,
  });

  const yearsRunning = new Date().getFullYear() - 2023;

  const scrollToAbout = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-[#0F1A08]" />
      {data.heroPhoto ? (
      <div className="absolute inset-0">
      <img src={data.heroPhoto} alt="Hero background" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-[#0F1A08]/70" />
      </div>
      ) : (
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a3008] via-[#0F1A08] to-[#0a1005]" />
      )}

      {/* Track lane lines */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute bottom-0 top-0 border-r border-[#D4AF37]/30"
            style={{ left: `${(i + 1) * 12.5}%` }} />
        ))}
      </div>

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-[#D4AF37]/5 blur-3xl" />
      </div>
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[#7A9B00]/8 blur-3xl pointer-events-none" />

      {/* Animated dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full bg-[#D4AF37]/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }} />
        ))}
      </div>

      {/* ── Running person ── */}
      <RunningPerson />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center pt-24">
        {/* Left */}
        <div className="text-center lg:text-left">
          <div className="anim-fade-up delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 mb-6">
            <Zap size={14} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase">
              Top 5 · State of Oklahoma
            </span>
            <Zap size={14} className="text-[#D4AF37]" />
          </div>

          <h1 className="anim-fade-up delay-2 font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-none mb-4 text-white">
            Meet<br />
            {/* ── Typing effect on HaSammie ── */}
            <span className="inline-flex items-baseline">
              <span className="text-shimmer text-5xl sm:text-5xl lg:text-6xl xl:text-7xl">{displayed}</span>
              {/* blinking cursor */}
              <span
                className="cursor-blink ml-0.5 text-[#D4AF37]"
                style={{ opacity: isDeleting ? 1 : undefined }}
              >|</span>
            </span>
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white/80">Suah</span>
          </h1>

          <p className="anim-fade-up delay-3 font-accent text-xl sm:text-2xl text-[#D4AF37]/80 italic mb-4 leading-relaxed">
            {data.hero.quote}
          </p>

          <p className="anim-fade-up delay-4 text-[#F5F0E8]/60 text-base sm:text-lg mb-8 max-w-md mx-auto lg:mx-0">
            {data.hero.tagline} · {data.hero.subtitle}
          </p>

          <div className="anim-fade-up delay-5 flex flex-wrap gap-4 justify-center lg:justify-start">
            <button
              onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold text-sm tracking-wide hover:scale-105 transition-transform duration-300 anim-pulse-ring"
            >
              Her Story
            </button>
            <button
              onClick={() => document.querySelector('#achievements')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3.5 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] font-semibold text-sm tracking-wide hover:bg-[#D4AF37]/10 transition-all duration-300"
            >
              View Achievements
            </button>
          </div>

          {/* Stats strip */}
          <div className="anim-fade-up delay-6 mt-10 flex gap-6 justify-center lg:justify-start">
            <div className="text-center">
              <div className="font-display text-3xl font-black text-[#D4AF37]">Top 5</div>
              <div className="text-[#F5F0E8]/50 text-xs tracking-wide">State Rank</div>
            </div>
            <div className="w-px bg-[#D4AF37]/20" />
            <div className="text-center">
              <div className="font-display text-3xl font-black text-[#D4AF37]">11th</div>
              <div className="text-[#F5F0E8]/50 text-xs tracking-wide">Grade</div>
            </div>
            <div className="w-px bg-[#D4AF37]/20" />
            <div className="text-center">
              <div className="font-display text-3xl font-black text-[#D4AF37]">{yearsRunning}yr{yearsRunning !== 1 ? 's' : ''}</div>
              <div className="text-[#F5F0E8]/50 text-xs tracking-wide">Running</div>
            </div>
          </div>
        </div>

        {/* Right — Profile Photo */}
        <div className="relative flex items-center justify-center anim-fade-up delay-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/20 scale-110 animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-[#7A9B00]/30 scale-125" />

            <div className="w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-[#D4AF37]/40 shadow-2xl shadow-[#D4AF37]/20 anim-float">
              {data.profilePhoto ? (
                <img src={data.profilePhoto} alt="Sammie Suah" className="w-full h-full object-cover object-top"/>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a3008] via-[#2d5016] to-[#1a2d0a] flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-4">
                    <span className="font-display text-5xl text-[#D4AF37]/50 font-black">S</span>
                  </div>
                  <p className="text-[#D4AF37]/40 text-sm font-medium tracking-wide">Photo Coming Soon</p>
                  <p className="text-[#F5F0E8]/20 text-xs mt-1">Add via Admin Dashboard</p>
                </div>
              )}
            </div>

            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[#D4AF37] to-[#9AB800] rounded-full p-3 shadow-lg">
              <Star size={20} className="text-[#0F1A08]" fill="currentColor" />
            </div>
            <div className="absolute -bottom-2 -left-4 bg-[#0F1A08] border border-[#D4AF37]/40 rounded-2xl px-4 py-2 shadow-lg">
              <p className="text-[#D4AF37] text-xs font-bold tracking-wide">UNION H.S.</p>
              <p className="text-[#F5F0E8]/60 text-xs">Tulsa, Oklahoma</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors z-10"
        style={{ animation: 'float 2s ease-in-out infinite' }}
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
};
