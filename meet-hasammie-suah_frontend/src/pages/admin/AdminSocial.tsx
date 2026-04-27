import React, { useState } from 'react';
import { Save, CheckCircle, Instagram, Twitter, Mail } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import { useSite } from '../../context/SiteContext';

const inputClass = "w-full bg-[#0F1A08]/80 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-white placeholder-[#F5F0E8]/20 focus:outline-none focus:border-[#D4AF37]/60 transition-colors text-sm";

export const AdminSocial: React.FC = () => {
  const { data, updateSocial, updateContact } = useSite();
  const [savedSocial, setSavedSocial] = useState(false);
  const [savedContact, setSavedContact] = useState(false);
  const [social, setSocial] = useState(data.social);
  const [contact, setContact] = useState(data.contact);

  const saveSocial = () => {
    updateSocial(social);
    setSavedSocial(true);
    setTimeout(() => setSavedSocial(false), 2500);
  };

  const saveContact = () => {
    updateContact(contact);
    setSavedContact(true);
    setTimeout(() => setSavedContact(false), 2500);
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8">
      <div className="mb-2">
        <h2 className="font-display text-3xl font-black text-white mb-1">Social & Contact</h2>
        <p className="text-[#F5F0E8]/40 text-sm">How fans and media can connect with you.</p>
      </div>

      {/* Social */}
      <div className="bg-[#1a2d0a]/50 border border-[#D4AF37]/20 rounded-2xl p-6 space-y-5">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Twitter size={18} className="text-[#D4AF37]" /> Social Media
        </h3>

        <div>
          <label className="flex items-center gap-2 text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-2">
            <Instagram size={13} /> Instagram Handle
          </label>
          <input
            type="text"
            className={inputClass}
            value={social.instagram || ''}
            onChange={e => setSocial({ ...social, instagram: e.target.value })}
            placeholder="@sammie.runs"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-2">
            <Twitter size={13} /> Twitter / X Handle
          </label>
          <input
            type="text"
            className={inputClass}
            value={social.twitter || ''}
            onChange={e => setSocial({ ...social, twitter: e.target.value })}
            placeholder="@sammiesuah"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-2">
            <SiTiktok size={13} /> TikTok Handle
          </label>
          <input
            type="text"
            className={inputClass}
            value={social.tiktok || ''}
            onChange={e => setSocial({ ...social, tiktok: e.target.value })}
            placeholder="@sammiesuah"
          />
        </div>

        <button
          onClick={saveSocial}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
        >
          {savedSocial ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Social Links</>}
        </button>
      </div>

      {/* Contact */}
      <div className="bg-[#1a2d0a]/50 border border-[#D4AF37]/20 rounded-2xl p-6 space-y-5">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Mail size={18} className="text-[#D4AF37]" /> Contact Info
        </h3>

        <div>
          <label className="block text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-2">General Email</label>
          <input
            type="email"
            className={inputClass}
            value={contact.email}
            onChange={e => setContact({ ...contact, email: e.target.value })}
            placeholder="sammie@example.com"
          />
        </div>

        <div>
          <label className="block text-[#D4AF37]/70 text-xs uppercase tracking-widest mb-2">Media & Press Email</label>
          <input
            type="email"
            className={inputClass}
            value={contact.forMedia}
            onChange={e => setContact({ ...contact, forMedia: e.target.value })}
            placeholder="media@example.com"
          />
        </div>

        <button
          onClick={saveContact}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#9AB800] text-[#0F1A08] font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
        >
          {savedContact ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Contact Info</>}
        </button>
      </div>
    </div>
  );
};
