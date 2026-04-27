import React from 'react';
import { Quote, MapPin, Calendar, School, Award, Smile, Heart, Zap, Trophy, BookOpen, Dumbbell, Users, Flame } from 'lucide-react';
import { useSite } from '../context/SiteContext';

const personalityTags = [
  { icon: <Smile size={14} />, label: 'Beautiful Smile' },
  { icon: <Heart size={14} />, label: 'Friendly Spirit' },
  { icon: <Zap size={14} />, label: 'Natural Speed' },
  { icon: <Trophy size={14} />, label: 'Champion Mindset' },
  { icon: <BookOpen size={14} />, label: 'Scholar Athlete' },
  { icon: <Dumbbell size={14} />, label: 'Work Ethic' },
  { icon: <Users size={14} />, label: 'Team Player' },
  { icon: <Flame size={14} />, label: 'Competitive Fire' },
];

export const AboutSection: React.FC = () => {
  const { data } = useSite();

  return (
    <section id="about" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1A08] via-[#121e09] to-[#0F1A08]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">The Runner Behind the Record</p>
          <h2 className="font-display text-5xl sm:text-6xl font-black text-white">
            Her <span className="text-shimmer">Story</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <div className="bg-[#1a2d0a]/60 border border-[#D4AF37]/20 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="font-display text-2xl font-bold text-[#D4AF37] mb-6">Quick Facts</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Calendar size={16} />, label: 'Born', value: 'August 5, 2009' },
                  { icon: <MapPin size={16} />, label: 'Hometown', value: 'Tulsa, Oklahoma' },
                  { icon: <School size={16} />, label: 'School', value: 'Union High School' },
                  { icon: <Award size={16} />, label: 'Grade', value: '11th Grade' },
                ].map(item => (
                  <div key={item.label} className="bg-[#0F1A08]/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-[#D4AF37]/60 mb-1">
                      {item.icon}
                      <span className="text-xs tracking-wide uppercase">{item.label}</span>
                    </div>
                    <p className="text-white font-semibold text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#7A9B00]/10 border border-[#D4AF37]/30 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 text-[#D4AF37]/10">
                <Quote size={64} />
              </div>
              <Quote size={24} className="text-[#D4AF37] mb-4" />
              <p className="font-accent text-lg text-[#F5F0E8]/90 italic leading-relaxed mb-4">
                {data.bio.coachNote}
              </p>
              <p className="text-[#D4AF37]/70 text-sm font-semibold">— {data.bio.coachName}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[#D4AF37] font-semibold text-base mb-4 leading-relaxed">
                {data.bio.intro}
              </p>
              <p className="text-[#F5F0E8]/70 text-base leading-relaxed">
                {data.bio.story}
              </p>
            </div>

            <div>
              <p className="text-[#D4AF37]/60 text-xs uppercase tracking-widest mb-3">Known for</p>
              <div className="flex flex-wrap gap-2">
                {personalityTags.map(tag => (
                  <span
                    key={tag.label}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-[#1a3008] border border-[#D4AF37]/20 text-[#F5F0E8]/80"
                  >
                    <span className="text-[#D4AF37]">{tag.icon}</span>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#D4AF37] to-[#9AB800] rounded-2xl p-5 mt-4">
              <div className="flex items-center gap-3">
                <Award size={28} className="text-[#0F1A08] flex-shrink-0" />
                <div>
                  <p className="text-[#0F1A08] font-bold text-base">Top 5 in Oklahoma</p>
                  <p className="text-[#0F1A08]/70 text-sm">One of the state's finest high school track athletes in 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
