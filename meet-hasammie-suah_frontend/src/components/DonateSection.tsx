/**
 * Meet HaSammie Suah — Frontend
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import React, { useState } from 'react';
import { Heart, Copy, CheckCheck, ExternalLink, DollarSign } from 'lucide-react';
import { SiCashapp, SiVenmo, SiGofundme } from 'react-icons/si';
import { MdOutlineAccountBalance } from 'react-icons/md';
import { useSite } from '../context/SiteContext';

export const DonateSection: React.FC = () => {
  const { data } = useSite();
  const d = data.donate;
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const methods = [
    {
      id: 'cashapp',
      name: 'Cash App',
      handle: d.cashapp,
      icon: <SiCashapp size={26} />,
      color: 'text-[#00D632]',
      border: 'border-[#00D632]/30',
      bg: 'bg-[#00D632]/10',
      link: d.cashapp ? `https://cash.app/${d.cashapp.startsWith('$') ? d.cashapp : '$' + d.cashapp}` : null,
      desc: 'Send directly via Cash App',
    },
    {
      id: 'venmo',
      name: 'Venmo',
      handle: d.venmo,
      icon: <SiVenmo size={26} />,
      color: 'text-[#3D95CE]',
      border: 'border-[#3D95CE]/30',
      bg: 'bg-[#3D95CE]/10',
      link: d.venmo ? `https://venmo.com/${d.venmo.replace('@', '')}` : null,
      desc: 'Send directly via Venmo',
    },
    {
      id: 'zelle',
      name: 'Zelle',
      handle: d.zelle,
      icon: <MdOutlineAccountBalance size={26} />,
      color: 'text-[#6B1BE3]',
      border: 'border-[#6B1BE3]/30',
      bg: 'bg-[#6B1BE3]/10',
      link: null,
      desc: 'Send via Zelle in your bank app',
    },
    {
      id: 'gofundme',
      name: 'GoFundMe',
      handle: 'View Campaign',
      icon: <SiGofundme size={26} />,
      color: 'text-[#00B964]',
      border: 'border-[#00B964]/30',
      bg: 'bg-[#00B964]/10',
      link: d.gofundme || null,
      desc: 'Full campaign — track her journey',
    },
  ].filter(m => m.handle && m.handle.trim() !== '');

  if (methods.length === 0) return null;

  return (
    <section id="donate" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1A08] via-[#0d1a06] to-[#0F1A08]" />
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-[#D4AF37]/4 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 mb-5">
            <Heart size={14} className="text-[#D4AF37]" fill="#D4AF37" />
            <span className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">Community Support</span>
            <Heart size={14} className="text-[#D4AF37]" fill="#D4AF37" />
          </div>
          <h2 className="font-display text-5xl sm:text-6xl font-black text-white mb-4">
            Support <span className="text-shimmer">Sammie</span>
          </h2>
          <p className="text-[#F5F0E8]/60 text-base max-w-lg mx-auto leading-relaxed">
            {d.message}
          </p>
        </div>

        {/* Cards */}
        <div className={`grid gap-4 mb-10 ${
          methods.length === 1 ? 'max-w-sm mx-auto' :
          methods.length === 2 ? 'sm:grid-cols-2 max-w-2xl mx-auto' :
          methods.length === 3 ? 'sm:grid-cols-3' :
          'sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {methods.map(m => (
            <div key={m.id}
              className={`group relative flex flex-col bg-[#1a2d0a]/60 border ${m.border} rounded-3xl p-6 hover:bg-[#1a2d0a]/90 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden`}>
              <div className={`absolute inset-0 ${m.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`} />
              <div className="relative z-10 flex flex-col h-full">
                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${m.bg} border ${m.border} flex items-center justify-center ${m.color}`}>
                    {m.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight">{m.name}</h3>
                    <p className="text-[#F5F0E8]/40 text-xs">{m.desc}</p>
                  </div>
                </div>

                {/* Handle row */}
                {m.id !== 'gofundme' && (
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0F1A08]/70 border ${m.border} mb-4`}>
                    <span className={`font-mono text-sm font-semibold ${m.color} truncate`}>{m.handle}</span>
                    <button onClick={() => copy(m.id, m.handle)}
                      className="text-[#F5F0E8]/40 hover:text-[#D4AF37] transition-colors ml-2 flex-shrink-0"
                      title="Copy">
                      {copied === m.id
                        ? <CheckCheck size={15} className="text-[#D4AF37]" />
                        : <Copy size={15} />}
                    </button>
                  </div>
                )}
                {copied === m.id && (
                  <p className="text-[#D4AF37] text-xs text-center -mt-2 mb-2 font-medium">Copied!</p>
                )}

                {/* CTA */}
                {m.link ? (
                  <a href={m.link} target="_blank" rel="noreferrer"
                    className={`mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl ${m.bg} ${m.color} border ${m.border} text-sm font-semibold hover:opacity-90 transition-opacity`}>
                    <ExternalLink size={14} />
                    Open {m.name}
                  </a>
                ) : (
                  <button onClick={() => copy(m.id, m.handle)}
                    className={`mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl ${m.bg} ${m.color} border ${m.border} text-sm font-semibold hover:opacity-90 transition-opacity`}>
                    <Copy size={14} />
                    Copy Info
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Thank you */}
        <div className="text-center bg-gradient-to-r from-[#D4AF37]/10 via-[#7A9B00]/10 to-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-3xl p-8">
          <DollarSign size={32} className="text-[#D4AF37] mx-auto mb-3" />
          <h3 className="font-display text-2xl font-bold text-white mb-2">Every Dollar Makes a Difference</h3>
          <p className="text-[#F5F0E8]/50 text-sm max-w-md mx-auto">
            Your support helps cover competition fees, proper training gear, travel to state meets, and coaching. Sammie and her family are deeply grateful for every contribution.
          </p>
        </div>
      </div>
    </section>
  );
};
