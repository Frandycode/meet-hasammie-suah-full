import React from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import type { Achievement } from '../context/SiteContext';

const medalConfig = {
  gold: { colors: 'from-[#D4AF37] to-[#F5D060]', text: 'text-[#0F1A08]', icon: <Trophy size={20} /> },
  silver: { colors: 'from-[#A8A9AD] to-[#D8D9DD]', text: 'text-[#0F1A08]', icon: <Medal size={20} /> },
  bronze: { colors: 'from-[#CD7F32] to-[#E8A04C]', text: 'text-[#0F1A08]', icon: <Star size={20} /> },
};

const AchievementCard: React.FC<{ achievement: Achievement; index: number }> = ({ achievement, index }) => {
  const medal = achievement.medal ? medalConfig[achievement.medal] : medalConfig.bronze;

  return (
    <div
      className="group relative bg-[#1a2d0a]/50 border border-[#D4AF37]/15 rounded-3xl p-6 hover:border-[#D4AF37]/40 hover:bg-[#1a2d0a]/80 transition-all duration-400 overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/3 rounded-full blur-2xl" />

      <div className="relative z-10 flex gap-4">
        {/* Medal badge */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${medal.colors} flex items-center justify-center ${medal.text} shadow-lg`}>
          {medal.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-tight">
              {achievement.title}
            </h3>
            <span className="flex-shrink-0 text-[#D4AF37]/50 text-xs font-mono bg-[#D4AF37]/10 px-2 py-1 rounded-full">
              {achievement.date}
            </span>
          </div>
          <p className="text-[#F5F0E8]/60 text-sm leading-relaxed">{achievement.description}</p>
        </div>
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.03) 0%, transparent 60%)' }} />
    </div>
  );
};

export const AchievementsSection: React.FC = () => {
  const { data } = useSite();

  return (
    <section id="achievements" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1A08] to-[#0d1807]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-[#D4AF37]/4 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">Earned, Not Given</p>
          <h2 className="font-display text-5xl sm:text-6xl font-black text-white">
            <span className="text-shimmer">Achievements</span>
          </h2>
          <p className="text-[#F5F0E8]/50 text-base mt-4 max-w-md mx-auto">
            A growing trophy case — and she's only in 11th grade.
          </p>
        </div>

        {/* Achievement list */}
        <div className="space-y-4">
          {data.achievements.map((achievement, i) => (
            <AchievementCard key={achievement.id} achievement={achievement} index={i} />
          ))}
        </div>

        {/* More to come */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5">
            <div className="w-2 h-2 rounded-full bg-[#7A9B00] animate-pulse" />
            <span className="text-[#D4AF37]/70 text-sm">More achievements being written every season...</span>
          </div>
        </div>
      </div>
    </section>
  );
};
