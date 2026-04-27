import React, { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

const inputClass = "w-full bg-[#0F1A08]/80 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/60 transition-colors text-sm";

export const AdminBio: React.FC = () => {
  const { data, updateBio } = useSite();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(data.bio);

  const handleSave = () => {
    updateBio(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="font-display text-3xl font-black text-white mb-1">Biography</h2>
        <p className="text-[#F5F0E8]/40 text-sm">Tell your story in your own words.</p>
      </div>

      <div className="bg-[#1a2d0a]/50 border border-[#D4AF37]/20 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-1.5">Intro Paragraph</label>
          <p className="text-[#F5F0E8]/30 text-xs mb-2">Shown in bold gold — the hook that grabs attention</p>
          <textarea
            rows={4}
            className={inputClass + ' resize-none'}
            value={form.intro}
            onChange={e => setForm({ ...form, intro: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-1.5">Main Story</label>
          <p className="text-[#F5F0E8]/30 text-xs mb-2">The full biographical story. Share your journey, passion, and growth.</p>
          <textarea
            rows={8}
            className={inputClass + ' resize-none'}
            value={form.story}
            onChange={e => setForm({ ...form, story: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-1.5">Coach's Quote</label>
          <p className="text-[#F5F0E8]/30 text-xs mb-2">A testimonial from your coach. Great for credibility!</p>
          <textarea
            rows={4}
            className={inputClass + ' resize-none'}
            value={form.coachNote}
            onChange={e => setForm({ ...form, coachNote: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-1.5">Coach's Name & Title</label>
          <input
            type="text"
            className={inputClass}
            value={form.coachName}
            onChange={e => setForm({ ...form, coachName: e.target.value })}
            placeholder="Coach Name · Union High School Track & Field"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
        >
          {saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save Biography</>}
        </button>
      </div>
    </div>
  );
};
