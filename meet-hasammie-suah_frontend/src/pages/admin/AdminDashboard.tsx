import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Image, Calendar, BarChart2, User, Share2, Settings, TrendingUp, Star, Lightbulb, Heart } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

const quickCards = [
  { label: 'Hero & Branding',  icon: <Settings size={20} />, to: '/admin/hero',         desc: 'Edit tagline, quote, photos',       color: 'from-[#D4AF37]/20 to-[#D4AF37]/5' },
  { label: 'Biography',        icon: <User size={20} />,     to: '/admin/bio',          desc: 'Update your story',                 color: 'from-[#7A9B00]/20 to-[#7A9B00]/5' },
  { label: 'Stats',            icon: <BarChart2 size={20} />,to: '/admin/stats',        desc: 'Personal records & metrics',        color: 'from-[#D4AF37]/20 to-[#D4AF37]/5' },
  { label: 'Achievements',     icon: <Trophy size={20} />,   to: '/admin/achievements', desc: 'Add trophies & awards',             color: 'from-[#F5D060]/20 to-[#F5D060]/5' },
  { label: 'Gallery',          icon: <Image size={20} />,    to: '/admin/gallery',      desc: 'Manage your photos',                color: 'from-[#7A9B00]/20 to-[#7A9B00]/5' },
  { label: 'Events',           icon: <Calendar size={20} />, to: '/admin/events',       desc: 'Upcoming meets & races',            color: 'from-[#D4AF37]/20 to-[#D4AF37]/5' },
  { label: 'Donations',        icon: <Heart size={20} />,    to: '/admin/donate',       desc: 'Cash App, Venmo, Zelle, GoFundMe', color: 'from-[#D4AF37]/20 to-[#D4AF37]/5' },
  { label: 'Social & Contact', icon: <Share2 size={20} />,   to: '/admin/social',       desc: 'Links & email info',                color: 'from-[#7A9B00]/20 to-[#7A9B00]/5' },
];

export const AdminDashboard: React.FC = () => {
  const { data } = useSite();
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-[#7A9B00] animate-pulse" />
          <span className="text-[#7A9B00] text-xs font-bold tracking-widest uppercase">Admin Mode Active</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-white mb-2">
          Welcome back, <span className="text-shimmer">Sammie!</span>
        </h1>
        <p className="text-[#F5F0E8]/50 text-sm">This is your personal site manager. Only you can see this page.</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { label: 'Achievements', value: data.achievements.length, icon: <Trophy size={16} /> },
          { label: 'Gallery Photos', value: data.gallery.length, icon: <Image size={16} /> },
          { label: 'Upcoming Events', value: data.events.filter(e => new Date(e.date) >= new Date()).length, icon: <Calendar size={16} /> },
          { label: 'State Rank', value: 'Top 5', icon: <Star size={16} /> },
        ].map(item => (
          <div key={item.label} className="bg-[#1a2d0a]/60 border border-[#D4AF37]/15 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#D4AF37]/50 mb-2 text-xs">{item.icon} {item.label}</div>
            <div className="font-display text-2xl font-black text-white">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <div>
        <h2 className="text-[#F5F0E8]/50 text-xs uppercase tracking-widest mb-4">Quick Access</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickCards.map(card => (
            <button key={card.label} onClick={() => navigate(card.to)}
              className={`group text-left bg-gradient-to-br ${card.color} border border-[#D4AF37]/15 rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all duration-300 hover:scale-[1.02]`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F1A08]/60 flex items-center justify-center text-[#D4AF37]">
                  {card.icon}
                </div>
                <TrendingUp size={14} className="text-[#D4AF37]/30 group-hover:text-[#D4AF37]/60 transition-colors" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{card.label}</h3>
              <p className="text-[#F5F0E8]/40 text-xs">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-10 bg-gradient-to-r from-[#D4AF37]/10 to-[#7A9B00]/10 border border-[#D4AF37]/20 rounded-2xl p-5">
        <p className="text-[#D4AF37] font-semibold text-sm mb-2 flex items-center gap-2">
          <Lightbulb size={16} /> Quick Tips
        </p>
        <ul className="text-[#F5F0E8]/50 text-xs space-y-1.5">
          <li className="flex items-start gap-2"><span className="text-[#D4AF37]/50 mt-0.5">→</span> Add your profile photo in <strong className="text-[#F5F0E8]/70">Hero &amp; Branding</strong> to make your site come alive</li>
          <li className="flex items-start gap-2"><span className="text-[#D4AF37]/50 mt-0.5">→</span> Keep achievements updated — college scouts check these!</li>
          <li className="flex items-start gap-2"><span className="text-[#D4AF37]/50 mt-0.5">→</span> Set up your <strong className="text-[#F5F0E8]/70">Donations</strong> page so supporters can contribute</li>
          <li className="flex items-start gap-2"><span className="text-[#D4AF37]/50 mt-0.5">→</span> Add upcoming meets so fans can cheer you on</li>
          <li className="flex items-start gap-2"><span className="text-[#D4AF37]/50 mt-0.5">→</span> All changes save instantly to your browser</li>
        </ul>
      </div>
    </div>
  );
};
