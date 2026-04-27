/**
 * Meet HaSammie Suah — Home Page
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import React from 'react';
import { Navbar }              from '../components/Navbar';
import { HeroSection }         from '../components/HeroSection';
import { MeetCountdownBanner } from '../components/MeetCountdown';
import { AboutSection }        from '../components/AboutSection';
import { StatsSection }        from '../components/StatsSection';
import { AchievementsSection } from '../components/AchievementsSection';
import { RaceResultsTimeline } from '../components/RaceResultsTimeline';
import { NewsSection }         from '../components/NewsSection';
import { RecruitingSection }   from '../components/RecruitingSection';
import { GallerySection }      from '../components/GallerySection';
import { VideoSection }        from '../components/VideoSection';
import { SocialFeedSection }   from '../components/SocialFeedSection';
import { EventsSection, ContactSection } from '../components/EventsContact';
import { DonateSection }       from '../components/DonateSection';
import { SupporterWall }       from '../components/SupporterWall';
import { PostcardSection }     from '../components/PostcardSection';
import { SponsorsSection }     from '../components/SponsorsSection';
import { Footer }              from '../components/Footer';
import { ScrollToTop }         from '../components/ScrollToTop';
import { useSite }             from '../context/SiteContext';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-[#0F1A08] flex items-center justify-center">
    <div className="text-center">
      <div
        className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#7A9B00] flex items-center justify-center text-[#0F1A08] font-black text-3xl mx-auto mb-4 animate-pulse"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        S
      </div>
      <p className="text-[#D4AF37]/60 text-sm tracking-widest uppercase">Loading...</p>
    </div>
  </div>
);

export const HomePage: React.FC = () => {
  const { loading, error } = useSite();

  if (loading) return <LoadingScreen />;

  if (error) {
    // Degrade gracefully — show the site with whatever data loaded
    console.warn('Site data error:', error);
  }

  return (
    <div className="min-h-screen bg-[#0F1A08]">
      <Navbar />
      <MeetCountdownBanner />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── About the athlete ───────────────────────────────────────────── */}
      <AboutSection />

      {/* ── Numbers ─────────────────────────────────────────────────────── */}
      <StatsSection />
      <AchievementsSection />
      <RaceResultsTimeline />

      {/* ── Stories ─────────────────────────────────────────────────────── */}
      <NewsSection />

      {/* ── Recruiting ──────────────────────────────────────────────────── */}
      <RecruitingSection />

      {/* ── Gallery & video ─────────────────────────────────────────────── */}
      <GallerySection />
      <VideoSection />

      {/* ── Social & community ──────────────────────────────────────────── */}
      <SocialFeedSection />
      <EventsSection />
      <DonateSection />
      <SupporterWall />
      <PostcardSection />

      {/* ── Partners & contact ──────────────────────────────────────────── */}
      <SponsorsSection />
      <ContactSection />

      <Footer />
      <ScrollToTop />
    </div>
  );
};
