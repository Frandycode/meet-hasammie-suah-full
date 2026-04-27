import React from 'react';
import { Calendar, MapPin, Flag, Dumbbell, Trophy, HelpCircle, Mail, Instagram, Twitter } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import { useSite } from '../context/SiteContext';
import type { UpcomingEvent } from '../context/SiteContext';
import { ContactForm } from './ContactForm';

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  meet:         { icon: <Flag size={14} />,        color: 'text-[#D4AF37]',     bg: 'bg-[#D4AF37]/10',    label: 'Meet' },
  championship: { icon: <Trophy size={14} />,      color: 'text-yellow-300',    bg: 'bg-yellow-300/10',   label: 'Championship' },
  training:     { icon: <Dumbbell size={14} />,    color: 'text-green-400',     bg: 'bg-green-400/10',    label: 'Training' },
  other:        { icon: <HelpCircle size={14} />,  color: 'text-[#F5F0E8]/50', bg: 'bg-white/5',         label: 'Other' },
};

const EventCard: React.FC<{ event: UpcomingEvent }> = ({ event }) => {
  const config = typeConfig[event.type] || typeConfig.other;
  const date = new Date(event.date);
  const isPast = date < new Date();
  return (
    <div className={`group flex gap-4 p-5 rounded-2xl border transition-all duration-300 ${
      isPast ? 'border-white/5 opacity-50' : 'border-[#D4AF37]/15 bg-[#1a2d0a]/40 hover:border-[#D4AF37]/40 hover:bg-[#1a2d0a]/70'
    }`}>
      <div className="flex-shrink-0 w-14 text-center bg-[#0F1A08]/80 rounded-xl p-2">
        <div className="text-[#D4AF37]/70 text-xs font-bold tracking-widest">
          {date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
        </div>
        <div className="font-display text-2xl font-black text-white">{date.getDate()}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
            {config.icon} {config.label}
          </span>
          {isPast && <span className="text-xs text-white/30 italic">Past</span>}
        </div>
        <h4 className="font-semibold text-white text-sm leading-tight mb-1">{event.title}</h4>
        <div className="flex items-center gap-1 text-[#F5F0E8]/40 text-xs">
          <MapPin size={11} /><span>{event.location}</span>
        </div>
      </div>
    </div>
  );
};

export const EventsSection: React.FC = () => {
  const { data } = useSite();
  const sorted = [...data.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return (
    <section id="events" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[#0F1A08]" />
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-64 h-64 bg-[#7A9B00]/5 rounded-full blur-3xl" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">Mark Your Calendar</p>
          <h2 className="font-display text-5xl sm:text-6xl font-black text-white">
            Upcoming <span className="text-shimmer">Events</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {sorted.map(event => <EventCard key={event.id} event={event} />)}
        </div>
        {sorted.length === 0 && (
          <div className="text-center py-16">
            <Calendar size={40} className="text-[#D4AF37]/20 mx-auto mb-3" />
            <p className="text-[#F5F0E8]/30">No events scheduled — check back soon</p>
          </div>
        )}
      </div>
    </section>
  );
};

export const ContactSection: React.FC = () => {
  const { data } = useSite();
  return (
    <section id="contact" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1A08] to-[#0a1005]" />
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full border-2 border-[#D4AF37]" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3">Reach Out</p>
        <h2 className="font-display text-5xl sm:text-6xl font-black text-white mb-6">
          Connect with <span className="text-shimmer">Sammie</span>
        </h2>
        <p className="text-[#F5F0E8]/60 text-base max-w-md mx-auto mb-12">
          Media inquiries, sponsorship opportunities, or just want to cheer her on?
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {[
            { label: 'General', email: data.contact.email },
            { label: 'Media & Press', email: data.contact.forMedia },
          ].map(c => (
            <a key={c.label} href={`mailto:${c.email}`}
              className="group flex items-center gap-4 p-6 rounded-2xl bg-[#1a2d0a]/50 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:bg-[#1a2d0a]/80 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                <Mail size={22} />
              </div>
              <div className="text-left">
                <p className="text-[#D4AF37]/60 text-xs uppercase tracking-wide mb-0.5">{c.label}</p>
                <p className="text-white font-medium text-sm">{c.email}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {data.social.instagram && (
            <a href={`https://instagram.com/${data.social.instagram.replace('@','')}`}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 text-pink-400 hover:scale-105 transition-all duration-300 text-sm">
              <Instagram size={16} />{data.social.instagram}
            </a>
          )}
          {data.social.twitter && (
            <a href={`https://twitter.com/${data.social.twitter.replace('@','')}`}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:scale-105 transition-all duration-300 text-sm">
              <Twitter size={16} />{data.social.twitter}
            </a>
          )}
          {data.social.tiktok && (
            <a href={`https://tiktok.com/${data.social.tiktok.replace('@','')}`}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/20 text-white/70 hover:scale-105 transition-all duration-300 text-sm">
              <SiTiktok size={15} />{data.social.tiktok}
            </a>
          )}
        </div>

        {/* Contact form */}
        <div className="mt-16 text-left max-w-2xl mx-auto">
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-3 text-center">
            Send a Message
          </p>
          <div className="bg-[#0F1A08]/60 border border-[#D4AF37]/15 rounded-2xl p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};
